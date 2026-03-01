import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  X,
  Save,
  Plus,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Trash2
} from "lucide-react";

export default function ICPModal({ isOpen, onClose, icpProfiles, selectedICPId, onICPChange }) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [newProfileMode, setNewProfileMode] = useState(false);

  const activeICP = icpProfiles.find(p => p.id === selectedICPId) || icpProfiles.find(p => p.active) || icpProfiles[0];

  const [formData, setFormData] = useState(activeICP || {
    profile_name: "New Profile",
    company_types: ["General Contractor", "Owner/Developer"],
    locations: ["San Francisco Bay Area"],
    company_size_min: "",
    company_size_max: "",
    revenue_min: "",
    revenue_max: "",
    decision_maker_titles: ["CEO", "Owner", "Project Manager"],
    pain_points: ["SWPPP compliance", "Permit delays"],
    industries: ["Commercial", "Residential"],
    active: false
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (editMode && activeICP?.id) {
        return await base44.entities.ICPSettings.update(activeICP.id, data);
      } else {
        // Deactivate all other profiles first if this one is being set to active
        if (data.active) {
          for (const profile of icpProfiles) {
            if (profile.active) {
              await base44.entities.ICPSettings.update(profile.id, { active: false });
            }
          }
        }
        return await base44.entities.ICPSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['icp-settings'] });
      setEditMode(false);
      setNewProfileMode(false);
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.ICPSettings.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['icp-settings'] });
      setEditMode(false);
    }
  });

  const addItem = (field, value) => {
    if (value && !formData[field]?.includes(value)) {
      setFormData({
        ...formData,
        [field]: [...(formData[field] || []), value]
      });
    }
  };

  const removeItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    saveProfileMutation.mutate(formData);
  };

  const handleNewProfile = () => {
    setFormData({
      profile_name: "New Profile",
      company_types: [],
      locations: [],
      company_size_min: "",
      company_size_max: "",
      revenue_min: "",
      revenue_max: "",
      decision_maker_titles: [],
      pain_points: [],
      industries: [],
      active: false
    });
    setNewProfileMode(true);
    setEditMode(true);
  };

  const handleSelectProfile = (profileId) => {
    const profile = icpProfiles.find(p => p.id === profileId);
    if (profile) {
      setFormData(profile);
      onICPChange(profileId);
      setEditMode(false);
      setNewProfileMode(false);
    }
  };

  const handleSetActive = async (profileId) => {
    // Deactivate all profiles
    for (const profile of icpProfiles) {
      if (profile.active && profile.id !== profileId) {
        await base44.entities.ICPSettings.update(profile.id, { active: false });
      }
    }
    // Activate selected profile
    await base44.entities.ICPSettings.update(profileId, { active: true });
    queryClient.invalidateQueries({ queryKey: ['icp-settings'] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Ideal Customer Profile Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Selector */}
          {!editMode && !newProfileMode && icpProfiles.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Select ICP Profile</label>
              <div className="grid gap-3">
                {icpProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      profile.id === selectedICPId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div onClick={() => handleSelectProfile(profile.id)} className="flex-1">
                        <h3 className="font-bold text-gray-900">{profile.profile_name}</h3>
                        <p className="text-sm text-gray-600">
                          {profile.company_types?.[0]} • {profile.locations?.[0]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.active && (
                          <Badge className="bg-green-500">Active</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetActive(profile.id)}
                        >
                          {profile.active ? "Active" : "Set Active"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFormData(profile);
                            setEditMode(true);
                          }}
                        >
                          Edit
                        </Button>
                        {icpProfiles.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Delete profile "${profile.profile_name}"?`)) {
                                deleteProfileMutation.mutate(profile.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!editMode && !newProfileMode && (
            <div className="flex gap-3">
              <Button onClick={handleNewProfile} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Profile
              </Button>
              {activeICP && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData(activeICP);
                    setEditMode(true);
                  }}
                >
                  Edit Current Profile
                </Button>
              )}
            </div>
          )}

          {/* Edit Form */}
          {(editMode || newProfileMode) && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Name
                </label>
                <Input
                  value={formData.profile_name || ""}
                  onChange={(e) => setFormData({...formData, profile_name: e.target.value})}
                  placeholder="e.g., Bay Area GCs"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Company Types
                </label>
                <ArrayInput
                  items={formData.company_types || []}
                  onAdd={(value) => addItem('company_types', value)}
                  onRemove={(index) => removeItem('company_types', index)}
                  placeholder="e.g., General Contractor"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  Target Locations
                </label>
                <ArrayInput
                  items={formData.locations || []}
                  onAdd={(value) => addItem('locations', value)}
                  onRemove={(index) => removeItem('locations', index)}
                  placeholder="e.g., San Francisco Bay Area"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Min Company Size
                  </label>
                  <Select value={formData.company_size_min || "any"} onValueChange={(value) => setFormData({...formData, company_size_min: value === "any" ? "" : value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Max Company Size
                  </label>
                  <Select value={formData.company_size_max || "any"} onValueChange={(value) => setFormData({...formData, company_size_max: value === "any" ? "" : value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Min Annual Revenue
                  </label>
                  <Select value={formData.revenue_min || "any"} onValueChange={(value) => setFormData({...formData, revenue_min: value === "any" ? "" : value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Any revenue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="Under $1M">Under $1M</SelectItem>
                      <SelectItem value="$1M-$5M">$1M-$5M</SelectItem>
                      <SelectItem value="$5M-$10M">$5M-$10M</SelectItem>
                      <SelectItem value="$10M-$50M">$10M-$50M</SelectItem>
                      <SelectItem value="$50M+">$50M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Max Annual Revenue
                  </label>
                  <Select value={formData.revenue_max || "any"} onValueChange={(value) => setFormData({...formData, revenue_max: value === "any" ? "" : value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Any revenue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="Under $1M">Under $1M</SelectItem>
                      <SelectItem value="$1M-$5M">$1M-$5M</SelectItem>
                      <SelectItem value="$5M-$10M">$5M-$10M</SelectItem>
                      <SelectItem value="$10M-$50M">$10M-$50M</SelectItem>
                      <SelectItem value="$50M+">$50M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Decision Maker Titles
                </label>
                <ArrayInput
                  items={formData.decision_maker_titles || []}
                  onAdd={(value) => addItem('decision_maker_titles', value)}
                  onRemove={(index) => removeItem('decision_maker_titles', index)}
                  placeholder="e.g., CEO, Project Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Key Pain Points
                </label>
                <ArrayInput
                  items={formData.pain_points || []}
                  onAdd={(value) => addItem('pain_points', value)}
                  onRemove={(index) => removeItem('pain_points', index)}
                  placeholder="e.g., SWPPP compliance"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-600" />
                  Target Industries
                </label>
                <ArrayInput
                  items={formData.industries || []}
                  onAdd={(value) => addItem('industries', value)}
                  onRemove={(index) => removeItem('industries', index)}
                  placeholder="e.g., Commercial, Residential"
                />
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t">
                <Button variant="outline" onClick={() => {
                  setEditMode(false);
                  setNewProfileMode(false);
                  setFormData(activeICP || formData);
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveProfileMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  {saveProfileMutation.isPending ? "Saving..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArrayInput({ items, onAdd, onRemove, placeholder }) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={placeholder}
          className="h-12"
        />
        <Button onClick={handleAdd} type="button">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="outline" className="pl-3 pr-1 py-1.5 text-sm">
            {item}
            <button
              onClick={() => onRemove(index)}
              className="ml-2 hover:bg-gray-200 rounded p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}