import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Send, CheckCircle, Upload, FileText, X } from "lucide-react";
import ScrollFadeSection from "../components/ScrollFadeSection";
import SmartFormInput from "../components/SmartFormInput";
import ServiceSuggester from "../components/ServiceSuggester";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceInterest: "",
    projectType: "",
    message: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
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

  // Real-time field validation
  const validateField = (name, value) => {
    const errors = {};
    
    switch(name) {
      case 'name':
        if (!value.trim()) errors.name = 'Name is required';
        else if (value.length < 2) errors.name = 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Invalid email format';
        break;
      case 'phone':
        if (value && !/^[\d\s\-\(\)]+$/.test(value)) errors.phone = 'Invalid phone number';
        break;
      case 'serviceInterest':
        if (!value) errors.serviceInterest = 'Please select a service';
        break;
      case 'message':
        if (!value.trim()) errors.message = 'Message is required';
        else if (value.length < 10) errors.message = 'Message must be at least 10 characters';
        break;
    }
    
    return errors;
  };

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear validation error when user starts typing
    if (touchedFields[field]) {
      const fieldErrors = validateField(field, value);
      setValidationErrors(prev => ({ ...prev, ...fieldErrors, [field]: fieldErrors[field] }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const fieldErrors = validateField(field, formData[field]);
    setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      Object.assign(errors, fieldErrors);
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const filesSection = uploadedFiles.length > 0 
        ? `\n\nAttached Files:\n${uploadedFiles.map(f => `- ${f.name}: ${f.url}`).join('\n')}`
        : '';

      const emailBody = `New Contact Form Submission from ${formData.name}

CONTACT INFORMATION:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Company: ${formData.company || 'Not provided'}

PROJECT DETAILS:
Service Interest: ${formData.serviceInterest}
Project Type: ${formData.projectType || 'Not provided'}

MESSAGE:
${formData.message}${filesSection}`;

      // Format HTML email
      const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0B67A6 0%, #0EA5A4 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .field { background: white; margin: 15px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #0B67A6; }
    .field-label { font-weight: bold; color: #0B67A6; margin-bottom: 5px; }
    .field-value { color: #333; }
    .files { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${formData.name}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${formData.email}">${formData.email}</a></div>
      </div>
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value">${formData.phone || 'Not provided'}</div>
      </div>
      <div class="field">
        <div class="field-label">Company</div>
        <div class="field-value">${formData.company || 'Not provided'}</div>
      </div>
      <div class="field">
        <div class="field-label">Service Interest</div>
        <div class="field-value">${formData.serviceInterest}</div>
      </div>
      <div class="field">
        <div class="field-label">Project Type</div>
        <div class="field-value">${formData.projectType || 'Not provided'}</div>
      </div>
      <div class="field">
        <div class="field-label">Message</div>
        <div class="field-value">${formData.message}</div>
      </div>
      ${uploadedFiles.length > 0 ? `
      <div class="files">
        <strong>📎 Attached Files:</strong><br>
        ${uploadedFiles.map(f => `<a href="${f.url}">${f.name}</a>`).join('<br>')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;

      // Send admin notification email
      try {
        await base44.integrations.Core.SendEmail({
          to: "dylanllouis@gmail.com",
          subject: `📧 New Contact Form from ${formData.name}`,
          body: htmlEmail
        });
      } catch (error) {
        console.error('Admin email error:', error);
        // Continue even if admin email fails
      }

      // Send immediate confirmation email to user
      try {
        const userConfirmationEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0B67A6 0%, #0EA5A4 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 32px; }
    .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 14px 28px; background: #0B67A6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ We've Received Your Message!</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #0B67A6;"><strong>Hello ${formData.name},</strong></p>
      <p>Thank you for contacting Pacific Engineering & Construction. We've successfully received your inquiry regarding <strong>${formData.serviceInterest}</strong>.</p>
      <p>Our team will review your message and respond within <strong>24 hours</strong> during business days.</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0B67A6; margin: 20px 0;">
        <p style="margin: 0;"><strong>📋 Your Submission Summary:</strong></p>
        <ul style="margin-top: 10px;">
          <li><strong>Service:</strong> ${formData.serviceInterest}</li>
          ${formData.projectType ? `<li><strong>Project Type:</strong> ${formData.projectType}</li>` : ''}
          ${formData.phone ? `<li><strong>Contact Phone:</strong> ${formData.phone}</li>` : ''}
        </ul>
      </div>

      <p>In the meantime, you can access your <strong>Client Portal</strong> to:</p>
      <ul>
        <li>Track your inquiry status</li>
        <li>Upload additional documents</li>
        <li>View project proposals</li>
        <li>Communicate directly with our team</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://pacificengineeringsf.com/ClientAuth" class="button">Access Your Client Portal</a>
      </div>

      <p style="margin-top: 30px;">If you have any urgent questions, please call us at <strong>(415)-419-6079</strong>.</p>
      
      <p style="margin-top: 20px;">Best regards,<br><strong>Pacific Engineering Team</strong></p>
    </div>
    <div class="footer">
      <p>Pacific Engineering & Construction Inc.<br>470 3rd St., San Francisco, CA 94107<br>(415)-419-6079 | dylanl.peci@gmail.com</p>
    </div>
  </div>
</body>
</html>`;

        await base44.integrations.Core.SendEmail({
          to: formData.email,
          subject: "✅ Your Inquiry Received - Pacific Engineering",
          body: userConfirmationEmail
        });
      } catch (error) {
        console.error('User confirmation email error:', error);
        // Continue even if confirmation email fails
      }

      // Create CRM contact record with uploaded files
      try {
        await base44.functions.invoke('createContactFromForm', {
          formData: formData,
          uploadedFiles: uploadedFiles,
          source: 'Contact Form'
        });
      } catch (error) {
        console.error('CRM integration error:', error);
        // Continue even if CRM fails - form submission still succeeds
      }

      // Create notifications for all admins
      const adminUsers = await base44.entities.User.filter({ role: 'admin' });
      for (const admin of adminUsers) {
        await base44.entities.Notification.create({
          recipient_email: admin.email,
          type: 'contact_form',
          title: 'New Contact Form Submission',
          message: `${formData.name} submitted a contact form for ${formData.serviceInterest}`,
          priority: 'high',
          read: false,
          metadata: { email: formData.email, phone: formData.phone, service: formData.serviceInterest }
        });
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        serviceInterest: "",
        projectType: "",
        message: ""
      });
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68eb69c51ce08e4c9fdca015/8799e5f43_Bay_Bridge_undersitde_sunrise.jpg')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-white mb-6 pt-40 text-5xl font-bold md:text-6xl">Get in Touch
          </h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
            Ready to discuss your stormwater management needs? We're here to help ensure your project's compliance.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <ScrollFadeSection>
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <Card className="p-8 border-0 shadow-xl">
                  <h2 className="text-gray-900 mb-6 text-3xl font-bold text-center">Send Us a Message

                  </h2>
                  
                  {submitted ?
                  <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                      <Button onClick={() => setSubmitted(false)} variant="outline">
                        Send Another Message
                      </Button>
                    </div> :

                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-gray-700 font-medium mb-2 block">
                            Full Name *
                          </Label>
                          <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          onBlur={() => handleFieldBlur('name')}
                          placeholder="John Smith"
                          className={`h-12 ${validationErrors.name && touchedFields.name ? 'border-red-500' : ''}`} />
                          {validationErrors.name && touchedFields.name && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="email" className="text-gray-700 font-medium mb-2 block">
                            Email Address *
                          </Label>
                          <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          onBlur={() => handleFieldBlur('email')}
                          placeholder="john@company.com"
                          className={`h-12 ${validationErrors.email && touchedFields.email ? 'border-red-500' : ''}`} />
                          {validationErrors.email && touchedFields.email && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="phone" className="text-gray-700 font-medium mb-2 block">
                            Phone Number
                          </Label>
                          <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          onBlur={() => handleFieldBlur('phone')}
                          placeholder="(555) 123-4567"
                          className={`h-12 ${validationErrors.phone && touchedFields.phone ? 'border-red-500' : ''}`} />
                          {validationErrors.phone && touchedFields.phone && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="company" className="text-gray-700 font-medium mb-2 block">
                            Company Name
                          </Label>
                          <SmartFormInput
                          id="company"
                          type="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="ABC Construction"
                          className="h-12" />

                        </div>
                      </div>

                      <div>
                        <Label htmlFor="serviceInterest" className="text-gray-700 font-medium mb-2 block">
                          Service Interest *
                        </Label>
                        <Select
                          value={formData.serviceInterest}
                          onValueChange={(value) => {
                            handleFieldChange('serviceInterest', value);
                            setTouchedFields(prev => ({ ...prev, serviceInterest: true }));
                          }}
                          required
                        >
                          <SelectTrigger className={`h-12 bg-white ${validationErrors.serviceInterest && touchedFields.serviceInterest ? 'border-red-500' : ''}`}>
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
                        {validationErrors.serviceInterest && touchedFields.serviceInterest && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.serviceInterest}</p>
                        )}
                      </div>

                      {/* Conditional field: show project type based on service */}
                      {formData.serviceInterest && formData.serviceInterest !== 'other' && (
                        <div>
                          <Label htmlFor="projectType" className="text-gray-700 font-medium mb-2 block">
                            Project Type
                          </Label>
                          <Select
                            value={formData.projectType}
                            onValueChange={(value) => handleFieldChange('projectType', value)}
                          >
                            <SelectTrigger className="h-12 bg-white">
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="infrastructure">Infrastructure</SelectItem>
                              <SelectItem value="industrial">Industrial</SelectItem>
                              <SelectItem value="municipal">Municipal</SelectItem>
                              <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="message" className="text-gray-700 font-medium mb-2 block">
                          Message *
                        </Label>
                        <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => handleFieldChange('message', e.target.value)}
                        onBlur={() => handleFieldBlur('message')}
                        placeholder="Tell us about your project and how we can help..."
                        className={`min-h-[150px] ${validationErrors.message && touchedFields.message ? 'border-red-500' : ''}`} />
                        {validationErrors.message && touchedFields.message && (
                          <p className="text-red-600 text-sm mt-1">{validationErrors.message}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">{formData.message.length} characters</p>
                      </div>

                      {/* AI Service Suggestions */}
                      {formData.message && (
                        <ServiceSuggester 
                          description={formData.message}
                          onSuggestionsReady={setAiSuggestions}
                        />
                      )}

                      {/* File Upload Section */}
                      <div>
                        <Label className="text-gray-700 font-medium mb-2 block">
                          Project Documents (Optional)
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

                        {/* Uploaded Files List */}
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
                      </div>

                      <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12">

                        {isSubmitting ?
                      <>Sending...</> :

                      <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                      }
                      </Button>
                    </form>
                  }
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-gray-900 mb-6 text-3xl font-bold text-center">Contact Information

                  </h2>
                  <p className="text-gray-700 mb-8 text-lg text-center leading-relaxed">Have questions about our services or need immediate assistance? Our team is ready to help you navigate your stormwater compliance needs.

                  </p>
                </div>

                <div className="space-y-6">
                  <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="mt-5 flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Phone className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                        <a href="tel:+14154196079" className="text-blue-600 hover:text-blue-700 text-lg">
                          (415)-419-6079
                        </a>
                        <p className="text-gray-600 text-sm mt-1">Mon-Fri, 8am-5pm PST</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="bg-cyan-100 mt-4 rounded-xl w-12 h-12 flex items-center justify-center">
                          <Mail className="w-6 h-6 text-cyan-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                        <a href="mailto:dylanl.peci@gmail.com" className="text-cyan-600 hover:text-cyan-700 text-lg break-all">
                          dylanl.peci@gmail.com
                        </a>
                        <p className="text-gray-600 text-sm mt-1">We respond within 24 hours</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="bg-teal-100 mt-4 rounded-xl w-12 h-12 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-teal-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Office Location</h3>
                        <p className="text-gray-700">
                          470 3rd St.<br />
                          San Francisco, CA 94107
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-8 bg-gradient-to-br from-blue-600 to-cyan-600 border-0 text-white">
                  <h3 className="mb-4 text-2xl font-bold text-center">Emergency Response

                  </h3>
                  <p className="text-blue-100 mb-4 text-center leading-relaxed">For urgent compliance issues or storm-related emergencies, we offer 24/7 emergency response services.

                  </p>
                  <a href="tel:+14154196079">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full">
                      <Phone className="w-5 h-5 mr-2" />
                      Emergency Hotline: (415)-419-6079
                    </Button>
                  </a>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </ScrollFadeSection>
    </div>);

}