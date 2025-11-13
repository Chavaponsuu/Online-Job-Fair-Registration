"use client";

import React, { useEffect, useState } from "react";
import GoogleMap from "../../components/GoogleMap";

type Company = {
  _id: string;
  name: string;
  address?: string;
  website?: string;
  description?: string;
  tel?: string;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          setError("You must be logged in to view companies. Please sign in.");
          setCompanies([]);
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/v1/company", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          setError("Not authorized (401). Please log in again.");
          setCompanies([]);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          setError(errBody.message || errBody.msg || "Failed to load companies");
          setCompanies([]);
          setLoading(false);
          return;
        }

        const data: Company[] = await res.json();
        setCompanies(data);
      } catch (err: any) {
        setError(err.message || "Network error");
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-black">Companies</h1>

        {loading && <div className="text-black">Loading companies...</div>}

        {/* Map - shown when companies loaded */}
        {!loading && companies && companies.length > 0 && (
          <div className="mb-6">
            <GoogleMap
              locations={companies.map((c) => ({ label: c.name, address: c.address || c.name }))}
              height="360px"
            />
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>
        )}

        {!loading && companies && companies.length === 0 && (
          <div className="text-black">No companies found.</div>
        )}

        <ul className="space-y-4">
          {companies &&
            companies.map((c) => (
              <li key={c._id} className="bg-white p-4 rounded shadow-sm text-black">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-medium">{c.name}</h2>
                    {c.description && <p className="text-sm text-black mt-1">{c.description}</p>}
                    <div className="text-sm text-black mt-2">
                      {c.address && <div>{c.address}</div>}
                      {c.website && (
                        <div>
                          <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600">
                            {c.website}
                          </a>
                        </div>
                      )}
                      {c.tel && <div>{c.tel}</div>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
