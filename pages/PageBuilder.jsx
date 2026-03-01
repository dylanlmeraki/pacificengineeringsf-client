import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import AdminRoute from "../components/internal/AdminRoute";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Plus, 
  Save, 
  Eye, 
  Trash2, 
  GripVertical,
  Type,
  BarChart3,
  Image,
  Video,
  Grid,
  Layout,
  FileText,
  Table2,
  PieChart,
  LineChart,
  Settings,
  ChevronRight,
  Layers,
  Sparkles,
  Search,
  Edit
} from "lucide-react";
import ComponentEditor from "../components/pagebuilder/ComponentEditor";
import PagePreview from "../components/pagebuilder/PagePreview";
import AITemplateGenerator from "../components/proposals/AITemplateGenerator";
import { Textarea } from "@/components/ui/textarea";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const COMPONENT_LIBRARY = [
  { type: "text", icon: Type, label: "Text Block", category: "Content" },
  { type: "heading", icon: FileText, label: "Heading", category: "Content" },
  { type: "signature", icon: FileText, label: "Signature", category: "Content" },
  { type: "image", icon: Image, label: "Image", category: "Media" },
  { type: "video", icon: Video, label: "Video Embed", category: "Media" },
  { type: "chart-bar", icon: BarChart3, label: "Bar Chart", category: "Data" },
  { type: "chart-line", icon: LineChart, label: "Line Chart", category: "Data" },
  { type: "chart-pie", icon: PieChart, label: "Pie Chart", category: "Data" },
  { type: "data-table", icon: Table2, label: "Data Table", category: "Data" },
  { type: "stats-card", icon: Grid, label: "Stats Cards", category: "Data" },
  { type: "container", icon: Layout, label: "Container", category: "Layout" }
];

export default function PageBuilder() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageComponents, setPageComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("all");
  const [templateFormData, setTemplateFormData] = useState({
    template_name: "",
    slug: "",
    description: "",
    category: "General",
    template_body: "",
    fields_def: [],
    active: true
  });

  const { data: pages = [] } = useQuery({
    queryKey: ['customPages'],
    queryFn: () => base44.entities.CustomPage.list('-updated_date', 50),
    initialData: []
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['proposalTemplates'],
    queryFn: () => base44.entities.ProposalTemplate.list('-created_date', 50),
    initialData: []
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals-pagebuilder'],
    queryFn: () => base44.entities.Proposal.list('-created_date', 20),
    initialData: []
  });

  const savePageMutation = useMutation({
    mutationFn: async (pageData) => {
      if (selectedPage?.id) {
        return await base44.entities.CustomPage.update(selectedPage.id, pageData);
      } else {
        return await base44.entities.CustomPage.create(pageData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customPages'] });
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomPage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customPages'] });
      setSelectedPage(null);
      setPageComponents([]);
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    if (result.source.droppableId === "component-library" && result.destination.droppableId === "canvas") {
      const component = COMPONENT_LIBRARY.find(c => c.type === result.draggableId);
      if (!component) return;
      
      const newComponent = {
        id: `${component.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: component.type,
        props: getDefaultProps(component.type)
      };
      
      const newComponents = [...pageComponents];
      newComponents.splice(result.destination.index, 0, newComponent);
      setPageComponents(newComponents);
      setSelectedComponent(newComponent);
    } else if (result.source.droppableId === "canvas" && result.destination.droppableId === "canvas") {
      const newComponents = [...pageComponents];
      const [removed] = newComponents.splice(result.source.index, 1);
      newComponents.splice(result.destination.index, 0, removed);
      setPageComponents(newComponents);
    }
  };

  const getDefaultProps = (type) => {
    const defaults = {
      text: { content: "Edit this text block...", fontSize: "base", color: "gray-900" },
      heading: { text: "New Heading", level: "h2", color: "gray-900" },
      signature: { label: "Signature", placeholder: "Sign here", required: true },
      image: { url: "", alt: "Image", width: "full" },
      video: { url: "", aspectRatio: "16/9" },
      "chart-bar": { title: "Bar Chart", dataSource: "prospects", metric: "status" },
      "chart-line": { title: "Line Chart", dataSource: "interactions", metric: "date" },
      "chart-pie": { title: "Pie Chart", dataSource: "prospects", metric: "segment" },
      "data-table": { dataSource: "prospects", columns: ["contact_name", "company_name", "status"] },
      "stats-card": { stats: [{ label: "Total", value: 0, icon: "users" }] },
      container: { columns: 2, gap: 4, padding: 4 }
    };
    return defaults[type] || {};
  };

  const loadPage = (page) => {
    setSelectedPage(page);
    setPageComponents(page.page_config?.components || []);
    setPreviewMode(false);
  };

  const createNewPage = () => {
    if (!newPageName.trim()) return;
    
    const slug = newPageName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSelectedPage({
      page_name: newPageName,
      page_slug: slug,
      page_type: "landing",
      description: "",
      is_published: false
    });
    setPageComponents([]);
    setNewPageName("");
    setShowNewPageForm(false);
  };

  const savePage = () => {
    if (!selectedPage) return;
    
    savePageMutation.mutate({
      ...selectedPage,
      page_config: { components: pageComponents }
    });
  };

  const updateComponent = (componentId, newProps) => {
    const updatedComponents = pageComponents.map(c => 
      c.id === componentId ? { ...c, props: newProps } : c
    );
    setPageComponents(updatedComponents);
    
    // Update the selected component reference to trigger re-render
    const updatedComponent = updatedComponents.find(c => c.id === componentId);
    if (updatedComponent) {
      setSelectedComponent(updatedComponent);
    }
  };

  const deleteComponent = (componentId) => {
    setPageComponents(pageComponents.filter(c => c.id !== componentId));
    setSelectedComponent(null);
  };

  const saveTemplateMutation = useMutation({
    mutationFn: async (data) => {
      if (editingTemplate?.id) {
        return await base44.entities.ProposalTemplate.update(editingTemplate.id, data);
      } else {
        return await base44.entities.ProposalTemplate.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposalTemplates'] });
      resetTemplateForm();
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.ProposalTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposalTemplates'] });
    }
  });

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setShowAIGenerator(false);
    setTemplateFormData({
      template_name: "",
      slug: "",
      description: "",
      category: "General",
      template_body: "",
      fields_def: [],
      active: true
    });
  };

  const handleAITemplateGenerated = (templateData) => {
    setTemplateFormData(templateData);
    setShowAIGenerator(false);
    saveTemplateMutation.mutate(templateData);
  };

  const editTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateFormData(template);
  };

  const addField = () => {
    setTemplateFormData({
      ...templateFormData,
      fields_def: [...(templateFormData.fields_def || []), { name: "", label: "", type: "text" }]
    });
  };

  const updateField = (index, key, value) => {
    const newFields = [...templateFormData.fields_def];
    newFields[index][key] = value;
    setTemplateFormData({ ...templateFormData, fields_def: newFields });
  };

  const removeField = (index) => {
    setTemplateFormData({
      ...templateFormData,
      fields_def: templateFormData.fields_def.filter((_, i) => i !== index)
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name?.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = templateCategoryFilter === "all" || template.category === templateCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const groupedComponents = COMPONENT_LIBRARY.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {});

  return (
    <AdminRoute>
      
        <div className="min-h-screen flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="border-b bg-white px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-6 h-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
                </div>
                {selectedPage && (
                  <Badge className="bg-blue-100 text-blue-700">
                    {selectedPage.page_name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {selectedPage && (
                  <>
                    <Button
                      variant={previewMode ? "default" : "outline"}
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {previewMode ? "Edit Mode" : "Preview"}
                    </Button>
                    <Button onClick={savePage} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Page
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Delete this page?")) {
                          if (selectedPage.id) {
                            deletePageMutation.mutate(selectedPage.id);
                          } else {
                            setSelectedPage(null);
                            setPageComponents([]);
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Pages List */}
            <div className="w-64 border-r bg-gray-50 overflow-y-auto">
              <div className="p-4">
                <div className="mb-4">
                  {!showNewPageForm ? (
                    <Button
                      onClick={() => setShowNewPageForm(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Page
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="Page name..."
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && createNewPage()}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={createNewPage} className="flex-1">Create</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowNewPageForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase">Pages</h3>
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => loadPage(page)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedPage?.id === page.id
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-white hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-sm">{page.page_name}</div>
                      <div className="text-xs text-gray-500 mt-1">{page.page_type}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              {/* Component Library */}
              {!previewMode && selectedPage && (
                <div className="w-64 border-r bg-white overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Components</h3>
                    <Droppable droppableId="component-library" isDropDisabled={true}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                          {Object.entries(groupedComponents).map(([category, components]) => (
                            <div key={category}>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</h4>
                              <div className="space-y-1">
                                {components.map((component, index) => (
                                  <Draggable
                                    key={component.type}
                                    draggableId={component.type}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <>
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-move transition-all ${
                                            snapshot.isDragging
                                              ? "border-blue-500 bg-blue-50 shadow-lg"
                                              : "border-gray-200 hover:border-blue-300 bg-white"
                                          }`}
                                        >
                                          <component.icon className="w-4 h-4 text-gray-600" />
                                          <span className="text-sm text-gray-700">{component.label}</span>
                                        </div>
                                        {snapshot.isDragging && (
                                          <div className="flex items-center gap-2 p-2 rounded-lg border-2 border-gray-200 bg-white">
                                            <component.icon className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm text-gray-700">{component.label}</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                            </div>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              )}

              {/* Canvas Area */}
              <div className="flex-1 overflow-y-auto bg-gray-100">
                {!selectedPage ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Page Selected</h3>
                      <p className="text-gray-600 mb-6">Create a new page or select an existing one to start building</p>
                      <Button onClick={() => setShowNewPageForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Page
                      </Button>
                    </div>
                  </div>
                ) : previewMode ? (
                  <PagePreview components={pageComponents} />
                ) : (
                  <div className="p-8">
                    <Card className="max-w-5xl mx-auto min-h-[600px] bg-white">
                      <Droppable droppableId="canvas">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-8 min-h-[600px] ${
                              snapshot.isDraggingOver ? "bg-blue-50" : ""
                            }`}
                          >
                            {pageComponents.length === 0 ? (
                              <div className="h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                  <ChevronRight className="w-12 h-12 mx-auto mb-2" />
                                  <p>Drag components here to start building</p>
                                </div>
                              </div>
                            ) : (
                              pageComponents.map((component, index) => (
                                <Draggable
                                  key={component.id}
                                  draggableId={component.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`mb-4 group relative ${
                                        snapshot.isDragging ? "opacity-50" : ""
                                      } ${
                                        selectedComponent?.id === component.id ? "ring-2 ring-blue-500" : ""
                                      }`}
                                      onClick={() => setSelectedComponent(component)}
                                    >
                                      <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div {...provided.dragHandleProps}>
                                          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                        </div>
                                      </div>
                                      <ComponentRenderer component={component} />
                                    </div>
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Card>
                  </div>
                )}
              </div>
            </DragDropContext>

            {/* Properties Panel */}
            {!previewMode && selectedComponent && selectedPage && (
              <div className="w-80 border-l bg-white overflow-y-auto">
                <ComponentEditor
                  component={selectedComponent}
                  onUpdate={(newProps) => updateComponent(selectedComponent.id, newProps)}
                  onDelete={() => deleteComponent(selectedComponent.id)}
                />
              </div>
            )}
          </div>
        </div>
      
    </AdminRoute>
  );
}

function ComponentRenderer({ component }) {
  const { type, props } = component;

  switch (type) {
    case "text":
      return <p className={`text-${props.fontSize} text-${props.color}`}>{props.content}</p>;
    case "heading":
      const Tag = props.level;
      return <Tag className={`font-bold text-${props.color} ${props.level === 'h1' ? 'text-4xl' : props.level === 'h2' ? 'text-3xl' : 'text-2xl'}`}>{props.text}</Tag>;
    case "signature":
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{props.label}</label>
          <div className="h-32 bg-gray-50 border-2 border-gray-300 rounded flex items-center justify-center text-gray-400">
            {props.placeholder}
          </div>
        </div>
      );
    case "image":
      return props.url ? <img src={props.url} alt={props.alt} className={`w-${props.width} rounded-lg`} /> : <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center"><Image className="w-8 h-8 text-gray-400" /></div>;
    case "container":
      return <div className={`grid grid-cols-${props.columns} gap-${props.gap} p-${props.padding} border-2 border-dashed border-gray-300 rounded-lg`}><div className="text-gray-400 text-center py-8">Container - Drop components inside</div></div>;
    default:
      return <div className="p-4 bg-gray-100 rounded-lg text-gray-700">Component: {type}</div>;
  }
}