"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAllProfilesForAdmin, updateVerificationStatus } from "@/lib/services/profiles";
import { Eye, CheckCircle, XCircle, FileText, AlertCircle, X } from "lucide-react";

export default function UserVerificationPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // Drawer & Modal State
  const [selectedUser, setSelectedUser] = useState(null); // For Doc Viewer Drawer
  const [rejectingUser, setRejectingUser] = useState(null); // For Rejection Reason Modal
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const supabase = createClient();
        const data = await getAllProfilesForAdmin(supabase);
        setUsers(data);
      } catch (err) {
        console.error("Unexpected error fetching profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Action 1: Approve Application
  const handleApprove = async (userId) => {
    try {
      const supabase = createClient();
      await updateVerificationStatus(supabase, userId, "verified");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId || u.profile_id === userId ? { ...u, verification_status: "verified" } : u))
      );
      if (selectedUser?.id === userId || selectedUser?.profile_id === userId) setSelectedUser(null);
    } catch (error) {
      console.error("Error approving profile:", error);
    }
  };

  // Action 2: Submit Rejection with Reason
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingUser) return;

    try {
      const supabase = createClient();
      const targetId = rejectingUser.id || rejectingUser.profile_id;
      await updateVerificationStatus(supabase, targetId, "rejected", rejectionReason);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetId || u.profile_id === targetId
            ? { ...u, verification_status: "rejected", rejection_reason: rejectionReason }
            : u
        )
      );
      setRejectingUser(null);
      setRejectionReason("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error rejecting profile:", error);
    }
  };

  const filteredUsers = users.filter((u) => (u.verification_status || "pending") === activeTab);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User KYC & Verification</h1>
          <p className="text-sm text-slate-500">Review pending identity credentials and update verification states.</p>
        </div>
      </div>

      {/* Queue Filter Tabs */}
      <div className="flex border-b border-slate-200">
        {["pending", "verified", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
              activeTab === tab
                ? "border-emerald-600 text-emerald-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab} Queue ({users.filter((u) => (u.verification_status || "pending") === tab).length})
          </button>
        ))}
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading user profiles...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No users found in "{activeTab}" status.</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-medium">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone / Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">{user.full_name || "N/A"}</td>
                  <td className="p-4 capitalize">{user.role || "Farmer"}</td>
                  <td className="p-4">{user.phone || user.email || "N/A"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        user.verification_status === "verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : user.verification_status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {user.verification_status || "pending"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Docs
                    </button>
                    {user.verification_status !== "verified" && (
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {user.verification_status !== "rejected" && (
                      <button
                        onClick={() => setRejectingUser(user)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Document Review Side-Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full p-6 shadow-xl space-y-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-slate-800">KYC Credential Audit</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-semibold">Applicant</label>
                <p className="text-base font-medium text-slate-800">{selectedUser.full_name}</p>
                <p className="text-sm text-slate-500">{selectedUser.role} • {selectedUser.phone}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <FileText className="w-4 h-4 text-emerald-600" /> Document Type
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedUser.role === "buyer" ? "GSTIN / Trade License" : "Land Khasra Record / ID Proof"}
                </p>
                {/* Image or Document Preview Placeholder */}
                <div className="mt-3 border-2 border-dashed border-slate-200 rounded-lg h-40 bg-white flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8 mb-1 text-slate-300" />
                  <span className="text-xs">Uploaded Document Preview</span>
                </div>
              </div>

              {selectedUser.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Previous Rejection Reason:
                  </p>
                  <p>{selectedUser.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex gap-3">
              <button
                onClick={() => handleApprove(selectedUser.id)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg"
              >
                Approve User
              </button>
              <button
                onClick={() => {
                  setRejectingUser(selectedUser);
                }}
                className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium text-sm rounded-lg"
              >
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Explanation Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">Enter Rejection Reason</h3>
            <p className="text-sm text-slate-500">
              Please explain why <strong>{rejectingUser.full_name}</strong>'s verification is being rejected. This note will be sent to the user.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Document photo is blurry or Land Khasra registration number mismatch."
                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingUser(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}