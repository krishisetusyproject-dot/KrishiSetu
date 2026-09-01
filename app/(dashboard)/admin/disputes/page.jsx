"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState(null);

  // Form state for updating a selected dispute
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("0.00");
  const [updating, setUpdating] = useState(false);

  // Fetch disputes from Supabase
  useEffect(() => {
    async function fetchDisputes() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("disputes")
        .select(`
          *,
          orders (
            id,
            total_amount,
            quantity,
            unit_price,
            listings (title, category)
          ),
          complainant:profiles!disputes_raised_by_fkey (full_name, phone, role),
          respondent:profiles!disputes_against_user_fkey (full_name, phone, role)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback simple fetch if foreign key aliases differ
        const { data: fallbackData } = await supabase
          .from("disputes")
          .select("*")
          .order("created_at", { ascending: false });
        setDisputes(fallbackData || []);
      } else if (data) {
        setDisputes(data);
      }
      setLoading(false);
    }

    fetchDisputes();
  }, []);

  const handleSelectDispute = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionNotes(dispute.resolution_notes || "");
    setRefundAmount(dispute.refund_amount || "0.00");
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedDispute) return;
    setUpdating(true);
    const supabase = createClient();

    const updatePayload = {
      status: newStatus,
      resolution_notes: resolutionNotes,
      refund_amount: parseFloat(refundAmount) || 0.0,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("disputes")
      .update(updatePayload)
      .eq("id", selectedDispute.id);

    if (!error) {
      setDisputes((prev) =>
        prev.map((item) =>
          item.id === selectedDispute.id ? { ...item, ...updatePayload } : item
        )
      );
      setSelectedDispute({ ...selectedDispute, ...updatePayload });
    } else {
      console.error("Error updating dispute:", error.message);
    }
    setUpdating(false);
  };

  const filteredDisputes = disputes.filter((d) =>
    filterStatus === "all" ? true : d.status?.toLowerCase() === filterStatus
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500 font-medium">
        Loading dispute claims...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Disputes & Claims</h1>
          <p className="text-slate-600 mt-1">
            Review and resolve order conflicts between farmers and buyers.
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "open", "under_review", "resolved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded text-xs font-semibold capitalize border transition-colors ${
                filterStatus === status
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disputes Table List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {filteredDisputes.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No disputes found matching status "{filterStatus}".
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="p-4">Reason & Details</th>
                  <th className="p-4">Complainant</th>
                  <th className="p-4">Respondent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredDisputes.map((item) => {
                  const status = (item.status || "open").toLowerCase();
                  const isSelected = selectedDispute?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-slate-50 border-l-4 border-l-emerald-600" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 capitalize">
                          {item.reason?.replace(/_/g, " ")}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {item.description}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">
                          {item.complainant?.full_name || "User"}
                        </div>
                        <div className="text-xs text-slate-500 capitalize">
                          {item.complainant?.role || "--"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">
                          {item.respondent?.full_name || "User"}
                        </div>
                        <div className="text-xs text-slate-500 capitalize">
                          {item.respondent?.role || "--"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            status === "resolved"
                              ? "bg-emerald-100 text-emerald-800"
                              : status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : status === "under_review"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleSelectDispute(item)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Dispute Resolution Detail Panel */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-3">
            Resolution Details
          </h2>

          {selectedDispute ? (
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">
                  Dispute Reason
                </span>
                <p className="font-bold text-slate-900 capitalize mt-0.5">
                  {selectedDispute.reason?.replace(/_/g, " ")}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">
                  Description
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mt-1 text-xs">
                  {selectedDispute.description}
                </p>
              </div>

              {selectedDispute.evidence_images && selectedDispute.evidence_images.length > 0 && (
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">
                    Evidence Uploads
                  </span>
                  <div className="flex gap-2 mt-1 overflow-x-auto">
                    {selectedDispute.evidence_images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-600 underline"
                      >
                        Evidence #{idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <hr className="border-slate-200" />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Approved Refund Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain official admin resolution..."
                  className="w-full p-2 border border-slate-300 rounded text-sm focus:outline-emerald-600"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleUpdateStatus("under_review")}
                  disabled={updating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded transition-colors"
                >
                  Mark Under Review
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus("resolved")}
                    disabled={updating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded transition-colors"
                  >
                    Resolve Dispute
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("rejected")}
                    disabled={updating}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs py-2 rounded border border-rose-200 transition-colors"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select a dispute row to inspect details and process resolutions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}