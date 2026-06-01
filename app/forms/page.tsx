"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';

type Submission = {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  course: string;
  city: string;
  message?: string | null;
  createdAt: string;
};

export default function FormsPage() {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("https://kvgit-forms-backend.vercel.app/api/submissions", {
      headers: {
        Authorization: "Basic YWRtaW46Y2hhbmdlbWU=",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch submissions");
        return res.json();
      })
      .then((json: Submission[]) => setData(json))
      .catch((err) => setError(err?.message ?? "Error fetching data"))
      .finally(() => setLoading(false));
  }, []);

  const courses = useMemo(() => {
    const set = new Set(data.map((d) => d.course).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const cities = useMemo(() => {
    const set = new Set(data.map((d) => d.city).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data
      .filter((item) => {
        if (courseFilter && item.course !== courseFilter) return false;
        if (cityFilter && item.city !== cityFilter) return false;
        if (!q) return true;
        return (
          (item.fullName && item.fullName.toLowerCase().includes(q)) ||
          (item.email && item.email.toLowerCase().includes(q)) ||
          (item.phone && item.phone.includes(q)) ||
          (item.course && item.course.toLowerCase().includes(q)) ||
          (item.city && item.city.toLowerCase().includes(q)) ||
          (item.message && item.message.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, search, courseFilter, cityFilter]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <Header breadcrumbs={[{ label: 'Dashboard' }, { label: 'Forms Data' }]} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h1 className="text-2xl font-semibold">Forms Data</h1>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone, course, city..."
                  className="w-full md:w-96 px-3 py-2 border rounded-md"
                />

                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-600">Error: {error}</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-md border">
                <table className="w-full min-w-max divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Course</th>
                      <th className="p-2 text-left">City</th>
                      <th className="p-2 text-left">Message</th>
                      <th className="p-2 text-left">Submitted At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-sm text-sidebar-foreground/60">
                          No submissions found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="p-2 align-top">{s.fullName}</td>
                          <td className="p-2 align-top">{s.phone}</td>
                          <td className="p-2 align-top">{s.email}</td>
                          <td className="p-2 align-top">{s.course}</td>
                          <td className="p-2 align-top">{s.city}</td>
                          <td className="p-2 align-top">{s.message ?? '-'}</td>
                          <td className="p-2 align-top">{new Date(s.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
