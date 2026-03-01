import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { submitConsultationForm } from "@/functions/submitConsultationForm";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, Info, Plus, X, ArrowRight, Loader2, Upload, FileText, Calendar as CalendarIcon } from "lucide-react";
import ScrollFadeSection from "../components/ScrollFadeSection";
import SmartFormInput from "../components/SmartFormInput";
import ServiceSuggester from "../components/ServiceSuggester";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

export default function Consultation() {
  const [addresses, setAddresses] = useState([
  { addressLine: "", zipCode: "", state: "CA", county: "", approximateSize: "" }]
  );
  const [moreThanFive, setMoreThanFive] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [formData, setFormData] = useState({ 
    serviceInterest: "",
    name: "",
    email: "",
    phone: "",
    company: ""
  });
  const [preferredContactDate, setPreferredContactDate] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const serviceOptions = [
    { value: "swppp", label: "SWPPP Services" },
    { value: "construction", label: "Construction Services" },
    { value: "inspections-testing", label: "Inspections & Testing" },
    { value: "special-inspections", label: "Special Inspections" },
    { value: "structural-engineering", label: "Structural Engineering" },
    { value: "multiple", label: "Multiple Services" },
    { value: "other", label: "Other / Not Sure" }
  ];

  // All California counties alphabetically
  const californiaCounties = [
  "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa",
  "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo",
  "Kern", "Kings", "Lake", "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa",
  "Mendocino", "Merced", "Modoc", "Mono", "Monterey", "Napa", "Nevada", "Orange",
  "Placer", "Plumas", "Riverside", "Sacramento", "San Benito", "San Bernardino",
  "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", "San Mateo",
  "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou",
  "Solano", "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare",
  "Tuolumne", "Ventura", "Yolo", "Yuba"];


  const addAddress = () => {
    if (addresses.length < 5) {
      setAddresses([...addresses, { addressLine: "", zipCode: "", state: "CA", county: "", approximateSize: "" }]);
    }
  };

  const removeAddress = (index) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses);
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
  };

  const wordCount = additionalDetails.trim().split(/\s+/).filter((word) => word.length > 0).length;

  const validateForm = () => {
    const errors = {};
    
    // Validate contact info
    if (!formData.name || !formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email || !formData.email.trim()) {
      errors.email = "Email is required";
    }
    
    // Validate at least one address has required fields
    const hasValidAddress = addresses.some(addr => addr.addressLine && addr.county);
    if (!hasValidAddress) {
      errors.addresses = "Please provide at least one location with address and county";
    }
    
    // Validate service interest
    if (!formData.serviceInterest) {
      errors.serviceInterest = "Please select a service interest";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setUploadedFiles(prev => [...prev, { name: file.name, url: file_url }]);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const locationsText = addresses.map((addr, i) => {
        return `Project Location ${i + 1}:
  Address: ${addr.addressLine || 'Not provided'}
  Zip Code: ${addr.zipCode || 'Not provided'}
  State: ${addr.state || 'CA'}
  County: ${addr.county || 'Not provided'}
  Approximate Size: ${addr.approximateSize || 'Not provided'}`;
      }).join('\n\n');

      const filesSection = uploadedFiles.length > 0 
        ? `\n\nAttached Documents:\n${uploadedFiles.map(f => `- ${f.name}: ${f.url}`).join('\n')}`
        : '';

      const emailBody = `SWPPP Requirements Inquiry

${locationsText}

More than 5 locations: ${moreThanFive || 'N/A'}

Service Interest: ${formData.serviceInterest ? serviceOptions.find(opt => opt.value === formData.serviceInterest)?.label : 'Not provided'}

Preferred Contact Date: ${preferredContactDate ? format(preferredContactDate, 'PPP') : 'Not specified'}

Additional Details:
${additionalDetails || 'No additional details provided'}${filesSection}`;

      // Send email to configured recipients
      await base44.integrations.Core.SendEmail({
        to: "dylanllouis@gmail.com",
        subject: "SWPPP Requirements Inquiry",
        body: emailBody
      });

      // Create CRM prospect and notifications
      try {
        await base44.functions.invoke('notifyAdminsContactForm', {
          name: formData.name || 'N/A',
          email: formData.email || 'N/A',
          phone: formData.phone,
          company: formData.company,
          serviceInterest: formData.serviceInterest ? serviceOptions.find(opt => opt.value === formData.serviceInterest)?.label : 'SWPPP Consultation',
          projectType: 'SWPPP',
          message: `${additionalDetails}\n\nLocations:\n${locationsText}`,
          uploadedFiles: uploadedFiles
        });
      } catch (error) {
        console.error("Error creating prospect:", error);
      }

      // Store submission data for confirmation display
      setSubmittedData({
        locations: addresses.filter(a => a.addressLine || a.county),
        service: serviceOptions.find(opt => opt.value === formData.serviceInterest)?.label,
        contactDate: preferredContactDate,
        filesCount: uploadedFiles.length
      });

      setSubmitted(true);
      setAddresses([{ addressLine: "", zipCode: "", state: "CA", county: "", approximateSize: "" }]);
      setMoreThanFive("");
      setFormData({ 
        serviceInterest: "",
        name: "",
        email: "",
        phone: "",
        company: ""
      });
      setPreferredContactDate(null);
      setUploadedFiles([]);
      setAdditionalDetails("");
      setValidationErrors({});
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to submit form. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-white mb-6 pt-40 text-5xl font-bold md:text-6xl">Let's Get Started.

          </h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">Fill out the form below to determine your project needs. We can tackle any size projects. In order for our team to best assist you, be as detailed as you'd like, and we will reach out very shortly.</p>
        </div>
      </section>

      {/* Main Content */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto">
            {/* Location Entry Form */}
            <Card className="p-8 border-0 shadow-xl mb-8">
              <h2 className="text-gray-900 mb-8 text-3xl font-bold text-center">Tell us about your project(s) below.</h2>
              
              <div className="space-y-6">
                {/* Contact Information */}
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="font-medium text-gray-900 mb-2 block">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="h-12"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-medium text-gray-900 mb-2 block">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="h-12"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="font-medium text-gray-900 mb-2 block">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(415) 123-4567"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="font-medium text-gray-900 mb-2 block">
                        Company
                      </Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your Company"
                        className="h-12"
                      />
                    </div>
                  </div>
                </Card>

                {/* Address Entries */}
                {addresses.map((address, index) =>
                <Card key={index} className="p-6 bg-gray-50 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Project Location {index + 1}
                      </h3>
                      {index > 0 &&
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAddress(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50">

                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                    }
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor={`address-${index}`} className="font-medium text-gray-900 mb-2 block">
                          Address Line
                        </Label>
                        <SmartFormInput
                        id={`address-${index}`}
                        type="address"
                        value={address.addressLine}
                        onChange={(e) => updateAddress(index, 'addressLine', e.target.value)}
                        placeholder="123 Main Street"
                        className="h-12" />

                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`zipcode-${index}`} className="font-medium text-gray-900 mb-2 block">
                            Zip Code
                          </Label>
                          <Input
                          id={`zipcode-${index}`}
                          value={address.zipCode}
                          onChange={(e) => updateAddress(index, 'zipCode', e.target.value)}
                          placeholder="94107"
                          maxLength={5}
                          className="h-12" />

                        </div>

                        <div>
                          <Label htmlFor={`state-${index}`} className="font-medium text-gray-900 mb-2 block">
                            State
                          </Label>
                          <Input
                          id={`state-${index}`}
                          value={address.state}
                          onChange={(e) => updateAddress(index, 'state', e.target.value)}
                          placeholder="CA"
                          className="h-12" />

                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`county-${index}`} className="font-medium text-gray-900 mb-2 block">
                          County
                        </Label>
                        <Select
                        value={address.county}
                        onValueChange={(value) => updateAddress(index, 'county', value)}>

                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a county..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {californiaCounties.map((county) =>
                          <SelectItem key={county} value={county}>
                                {county}
                              </SelectItem>
                          )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`size-${index}`} className="font-medium text-gray-900 mb-2 block">
                          Approximate size?
                        </Label>
                        <Select
                        value={address.approximateSize}
                        onValueChange={(value) => updateAddress(index, 'approximateSize', value)}>

                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select size..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1 acre or less">1 acre or less</SelectItem>
                            <SelectItem value="1-5 acres">1-5 acres</SelectItem>
                            <SelectItem value="5+ acres">5+ acres</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`service-${index}`} className="font-medium text-gray-900 mb-2 block">
                          Service Interest *
                        </Label>
                        <Select
                          value={formData.serviceInterest}
                          onValueChange={(value) => {
                            setFormData({ ...formData, serviceInterest: value });
                            setValidationErrors(prev => ({ ...prev, serviceInterest: undefined }));
                          }}
                          required
                        >
                          <SelectTrigger id={`service-${index}`} className={`h-12 ${validationErrors.serviceInterest ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select service you're interested in" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.serviceInterest && (
                          <p className="text-red-600 text-sm mt-2">{validationErrors.serviceInterest}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Add Location Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={addAddress}
                    disabled={addresses.length >= 5}
                    className={`${
                    addresses.length >= 5 ?
                    'bg-gray-300 cursor-not-allowed' :
                    'bg-blue-600 hover:bg-blue-700'}`
                    }>

                    <Plus className="w-5 h-5 mr-2" />
                    Add Location
                  </Button>
                </div>

                {/* More Than 5 Locations */}
                {addresses.length === 5 &&
                <Card className="p-6 bg-amber-50 border-amber-200">
                    <Label htmlFor="more-than-five" className="font-semibold text-gray-900 mb-3 block text-lg">
                      More than 5 locations?
                    </Label>
                    <Select value={moreThanFive} onValueChange={setMoreThanFive}>
                      <SelectTrigger id="more-than-five" className="h-12 bg-white">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>

                    {moreThanFive === "yes" &&
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-amber-300">
                        <p className="text-gray-700 leading-relaxed">
                          We're delighted to help with any size project and will discuss with you shortly. In the meantime, please fill out any necessary details in the <strong>"Anything else we should know?"</strong> field below.
                        </p>
                      </div>
                  }
                  </Card>
                }

                {/* Validation Error for Addresses */}
                {validationErrors.addresses && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 text-sm font-medium">{validationErrors.addresses}</p>
                  </div>
                )}

                {/* Additional Details */}
                <Card className={`p-6 transition-all duration-300 ${
                moreThanFive === "yes" ?
                'bg-amber-50 border-amber-300 border-2 shadow-lg' :
                'bg-white border-gray-200'}`
                }>
                  <Label htmlFor="additional-details" className="font-semibold text-gray-900 mb-3 block text-lg">
                    Anything else we should know?
                  </Label>
                  <Textarea
                    id="additional-details"
                    value={additionalDetails}
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/).filter((word) => word.length > 0);
                      if (words.length <= 500) {
                        setAdditionalDetails(e.target.value);
                      }
                    }}
                    placeholder="Tell us about your project, approximate size/acreage, timeline, special requirements, or any questions you have..."
                    className="min-h-[200px] resize-none" />

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      {wordCount} / 500 words
                    </p>
                    {wordCount >= 500 &&
                    <p className="text-sm text-amber-600 font-medium">
                        Word limit reached
                      </p>
                    }
                  </div>
                </Card>

                {/* AI Service Suggestions */}
                {additionalDetails && (
                  <ServiceSuggester 
                    description={additionalDetails}
                    onSuggestionsReady={setAiSuggestions}
                  />
                )}

                {/* File Upload */}
                <Card className="p-6 bg-white border-gray-200">
                  <Label className="text-gray-700 font-medium mb-2 block">
                    Attach Documents (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="text-blue-600 font-medium hover:text-blue-700">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, JPG, PNG, DWG up to 10MB each
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Preferred Contact Date */}
                <Card className="p-6 bg-white border-gray-200">
                  <Label className="text-gray-700 font-medium mb-2 block">
                    Preferred Contact Date (Optional)
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {preferredContactDate ? format(preferredContactDate, 'PPP') : 'Select a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={preferredContactDate}
                        onSelect={setPreferredContactDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-gray-500 mt-2">
                    Let us know when you'd like to be contacted
                  </p>
                </Card>

                {/* Submit Button */}
                {submitted ? (
                  <Card className="p-8 bg-green-50 border-green-200">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Submission Received!
                      </h3>
                      
                      {/* Submission Summary */}
                      <div className="bg-white rounded-lg p-6 mb-6 text-left">
                        <h4 className="font-semibold text-gray-900 mb-3">Your Submission Summary:</h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          {submittedData?.locations?.length > 0 && (
                            <p><strong>Locations:</strong> {submittedData.locations.length} project location(s)</p>
                          )}
                          {submittedData?.service && (
                            <p><strong>Service:</strong> {submittedData.service}</p>
                          )}
                          {submittedData?.contactDate && (
                            <p><strong>Preferred Contact:</strong> {format(submittedData.contactDate, 'PPP')}</p>
                          )}
                          {submittedData?.filesCount > 0 && (
                            <p><strong>Documents Attached:</strong> {submittedData.filesCount} file(s)</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-900 font-medium mb-1">⏱️ Estimated Response Time</p>
                        <p className="text-blue-700 text-sm">
                          Our team typically responds within <strong>24-48 hours</strong> during business days. For urgent matters, please call us at (415)-419-6079.
                        </p>
                      </div>

                      <p className="text-gray-600 mb-4">
                        Thank you for your inquiry. A member of our team will review your submission and reach out to discuss your project needs.
                      </p>
                      <Button onClick={() => { setSubmitted(false); setSubmittedData(null); }} variant="outline">
                        Submit Another Inquiry
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="flex justify-center pt-6">
                    <Button 
                      size="lg" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r text-primary-foreground px-6 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-10 from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>Submit - We Will Reach Out Shortly</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Information Card */}
            <Card className="p-8 mb-8 bg-blue-50 border-blue-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">About SWPPP Requirements</h3>
                    {isInfoExpanded &&
                    <p className="text-gray-700 leading-relaxed mt-4">
                        A Stormwater Pollution Prevention Plan (SWPPP) is typically required for construction projects that disturb one acre or more of land, or are part of a larger common plan of development that disturbs one acre or more. Requirements may vary by location and project type. Please fill out form below fully, so that our licensed and certified professionals can best assist you.
                      </p>
                    }
                  </div>
                </div>
                <button
                  onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  
                  {isInfoExpanded ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            </Card>

            {/* General Information */}
            <div className="mt-12 space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">When is a SWPPP Required?</h3>
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  <p>
                    <strong>Federal Requirements:</strong> Under the Clean Water Act's National Pollutant Discharge Elimination System (NPDES) program, a SWPPP is required for construction activities that disturb one acre or more of land surface, or are part of a larger common plan of development.
                  </p>
                  <p>
                    <strong>California Requirements:</strong> The California State Water Resources Control Board requires coverage under the Construction General Permit for qualifying projects throughout the state, including the San Francisco Bay Area.
                  </p>
                  <p>
                    <strong>Local Requirements:</strong> Many California municipalities have additional local stormwater requirements that may apply to smaller projects or have specific provisions. It is pertinent that you are in touch with locally trained and qualified professionals to work with you through nuanced local regulations.
                  </p>
                </div>
              </Card>


              <Card className="p-8 bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-3">We've Got You Covered!</h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">Our dedicated teams consisting of many decades of combined expertise in environmental and structural engineering at the private, commercial, and government levels will help you breeze through this compliance part of your project(s).

                  </p>
                  <a href="mailto:dylanl.peci@gmail.com?subject=SWPPP Consultation Request">
              <Button size="lg" className="bg-cyan-500 text-white px-8 py-6 text-lg font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-10 border-2 border-white hover:bg-white/10 backdrop-blur-sm group">
                Get a Free Consultation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </ScrollFadeSection>
    </div>);

}