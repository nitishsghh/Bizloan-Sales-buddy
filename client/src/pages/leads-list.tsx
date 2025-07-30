import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Filter, User, Phone } from "lucide-react";
import { Lead, Client } from "@shared/schema";
import Logo from "@/components/logo";

export default function LeadsListPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: leads = [], isLoading } = useQuery<(Lead & { client: Client })[]>({
    queryKey: ["/api/leads"],
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.client.mobileNumber.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green": return "bg-success text-white";
      case "amber": return "bg-warning text-white";
      case "red": return "bg-error text-white";
      case "sanctioned": return "bg-success text-white";
      case "disbursed": return "bg-success text-white";
      case "rejected": return "bg-error text-white";
      default: return "bg-primary text-white";
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "green": return "border-success";
      case "amber": return "border-warning";
      case "red": return "border-error";
      case "sanctioned": return "border-success";
      case "disbursed": return "border-success";
      case "rejected": return "border-error";
      default: return "border-primary";
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(Number(amount));
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="text-white text-lg">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex justify-center mb-4">
            <Logo size="medium" />
          </div>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/")}
              className="text-primary"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">All Leads</h1>
            <Button variant="ghost" size="icon" className="text-primary">
              <Filter className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search leads by name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { value: "all", label: "All" },
            { value: "green", label: "Green" },
            { value: "amber", label: "Amber" },
            { value: "red", label: "Red" },
            { value: "sanctioned", label: "Sanctioned" },
            { value: "disbursed", label: "Disbursed" },
          ].map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      <div className="px-4 py-6 space-y-4">
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No leads found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className={`border-l-4 ${getBorderColor(lead.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="text-gray-600 h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{lead.client.fullName}</h4>
                      <p className="text-sm text-gray-500">{lead.client.mobileNumber}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Loan Amount</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(lead.client.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Purpose</p>
                    <p className="font-semibold text-gray-800">
                      {lead.client.loanPurpose.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Created: {formatDate(lead.createdAt)}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    <Button size="sm" className="bg-success hover:bg-success/90">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
