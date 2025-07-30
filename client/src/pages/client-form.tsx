import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, User, Briefcase, DollarSign, Home, FileText } from "lucide-react";
import Logo from "@/components/logo";

const clientFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  aadharNumber: z.string().min(12, "Valid Aadhar number is required"),
  panNumber: z.string().min(10, "Valid PAN number is required"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  
  employmentType: z.string().min(1, "Employment type is required"),
  companyName: z.string().min(1, "Company/Business name is required"),
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  workExperience: z.string().optional(),
  officeAddress: z.string().optional(),
  
  loanPurpose: z.string().min(1, "Loan purpose is required"),
  loanAmount: z.string().min(1, "Loan amount is required"),
  tenure: z.string().optional(),
  loanDescription: z.string().optional(),
  
  propertyType: z.string().optional(),
  propertyAddress: z.string().optional(),
  propertyValue: z.string().optional(),
  propertyArea: z.string().optional(),
  propertyDocuments: z.array(z.string()).optional(),
  
  additionalNotes: z.string().optional(),
});

type ClientForm = z.infer<typeof clientFormSchema>;

export default function ClientFormPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: "",
      aadharNumber: "",
      panNumber: "",
      mobileNumber: "",
      address: "",
      city: "",
      pincode: "",
      employmentType: "",
      companyName: "",
      monthlyIncome: "",
      workExperience: "",
      officeAddress: "",
      loanPurpose: "",
      loanAmount: "",
      tenure: "",
      loanDescription: "",
      propertyType: "",
      propertyAddress: "",
      propertyValue: "",
      propertyArea: "",
      propertyDocuments: [],
      additionalNotes: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientForm) => {
      const formattedData = {
        ...data,
        monthlyIncome: parseFloat(data.monthlyIncome) || 0,
        loanAmount: parseFloat(data.loanAmount) || 0,
        tenure: data.tenure ? parseInt(data.tenure) : null,
        propertyValue: data.propertyValue ? parseFloat(data.propertyValue) : null,
        propertyArea: data.propertyArea ? parseInt(data.propertyArea) : null,
      };
      
      const response = await apiRequest("POST", "/api/clients", formattedData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Client created successfully",
        description: "The client information has been saved and a lead has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/statistics"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to create client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientForm) => {
    createClientMutation.mutate(data);
  };

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
            <h1 className="text-lg font-semibold text-gray-800">Add New Client</h1>
            <div className="w-6"></div>
          </div>
        </div>
      </div>

      {/* Client Form */}
      <div className="px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Details Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="text-primary mr-2 h-5 w-5" />
                  Personal Details
                </h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aadharNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhar Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="XXXX XXXX XXXX" maxLength={14} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="panNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PAN Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="ABCDE1234F" maxLength={10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Enter mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter complete address" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pincode" maxLength={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Details Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Briefcase className="text-primary mr-2 h-5 w-5" />
                  Work Details
                </h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="salaried">Salaried</SelectItem>
                            <SelectItem value="self-employed">Self Employed</SelectItem>
                            <SelectItem value="business">Business Owner</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Business Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company or business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter monthly income" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Experience</FormLabel>
                          <FormControl>
                            <Input placeholder="Years of experience" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="officeAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter office address" rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Loan Details Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="text-primary mr-2 h-5 w-5" />
                  Loan Details
                </h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="loanPurpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Purpose *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select loan purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="home-loan">Home Loan</SelectItem>
                            <SelectItem value="business-loan">Business Loan</SelectItem>
                            <SelectItem value="personal-loan">Personal Loan</SelectItem>
                            <SelectItem value="vehicle-loan">Vehicle Loan</SelectItem>
                            <SelectItem value="property-loan">Property Loan</SelectItem>
                            <SelectItem value="working-capital">Working Capital</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="loanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Amount *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter loan amount" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tenure (Years)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Loan tenure" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="loanDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description of loan requirement" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Details Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Home className="text-primary mr-2 h-5 w-5" />
                  Property Details
                </h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="plot">Plot/Land</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="propertyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter property address" rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Value</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Estimated value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="propertyArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area (Sq.ft)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Property area" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Document Checklist */}
                  <div>
                    <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">Property Documents Available</FormLabel>
                    <div className="space-y-2">
                      {[
                        { id: "sale-deed", label: "Sale Deed" },
                        { id: "property-card", label: "Property Card" },
                        { id: "khata-certificate", label: "Khata Certificate" },
                        { id: "tax-receipts", label: "Tax Receipts" },
                        { id: "encumbrance-certificate", label: "Encumbrance Certificate" },
                      ].map((doc) => (
                        <FormField
                          key={doc.id}
                          control={form.control}
                          name="propertyDocuments"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(doc.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), doc.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== doc.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {doc.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="text-primary mr-2 h-5 w-5" />
                  Additional Notes
                </h3>
                
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes or remarks about the client..." 
                          rows={4} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-gradient-to-br from-blue-500 to-blue-700 pt-4 pb-6">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
                disabled={createClientMutation.isPending}
              >
                {createClientMutation.isPending ? "Submitting..." : "Submit Client Information"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
