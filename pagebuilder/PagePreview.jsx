import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Image } from "lucide-react";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function PagePreview({ components }) {
  return (
    <div className="p-8 bg-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {components.map((component) => (
          <ComponentPreview key={component.id} component={component} />
        ))}
      </div>
    </div>
  );
}

function ComponentPreview({ component }) {
  const { type, props } = component;

  switch (type) {
    case "text":
      return <p className={`text-${props.fontSize} text-${props.color} leading-relaxed`}>{props.content}</p>;
    
    case "heading":
      const Tag = props.level;
      const sizes = { h1: 'text-4xl', h2: 'text-3xl', h3: 'text-2xl' };
      return <Tag className={`font-bold text-${props.color} ${sizes[props.level]} mb-4`}>{props.text}</Tag>;
    
    case "image":
      return props.url ? (
        <img src={props.url} alt={props.alt} className={`w-${props.width} rounded-lg shadow-lg`} />
      ) : (
        <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <Image className="w-12 h-12 text-gray-400" />
        </div>
      );
    
    case "video":
      if (!props.url) return <div className="h-96 bg-gray-200 rounded-lg" />;
      const videoId = props.url.includes('youtube') ? props.url.split('v=')[1]?.split('&')[0] : null;
      return videoId ? (
        <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null;
    
    case "chart-bar":
      return <ChartBarComponent {...props} />;
    
    case "chart-line":
      return <ChartLineComponent {...props} />;
    
    case "chart-pie":
      return <ChartPieComponent {...props} />;
    
    case "data-table":
      return <DataTableComponent {...props} />;
    
    case "stats-card":
      return <StatsCardComponent {...props} />;
    
    case "container":
      return (
        <div className={`grid grid-cols-${props.columns} gap-${props.gap} p-${props.padding}`}>
          {[...Array(props.columns)].map((_, i) => (
            <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
              Column {i + 1}
            </div>
          ))}
        </div>
      );
    
    default:
      return <Card className="p-6 bg-gray-50"><p className="text-gray-600">Component: {type}</p></Card>;
  }
}

function ChartBarComponent({ title, dataSource, metric }) {
  const { data: rawData = [] } = useQuery({
    queryKey: [dataSource],
    queryFn: async () => {
      if (dataSource === 'prospects') return await base44.entities.Prospect.list('-created_date', 100);
      if (dataSource === 'projects') return await base44.entities.Project.list('-created_date', 100);
      if (dataSource === 'interactions') return await base44.entities.Interaction.list('-created_date', 100);
      return [];
    },
    initialData: []
  });

  const chartData = Object.entries(
    rawData.reduce((acc, item) => {
      const key = item[metric] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function ChartLineComponent({ title, dataSource, metric }) {
  const { data: rawData = [] } = useQuery({
    queryKey: [dataSource],
    queryFn: async () => {
      if (dataSource === 'interactions') return await base44.entities.Interaction.list('-interaction_date', 100);
      return [];
    },
    initialData: []
  });

  const chartData = rawData.slice(0, 20).reverse().map((item, idx) => ({
    name: `Day ${idx + 1}`,
    value: idx + 1
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

function ChartPieComponent({ title, dataSource, metric }) {
  const { data: rawData = [] } = useQuery({
    queryKey: [dataSource],
    queryFn: async () => {
      if (dataSource === 'prospects') return await base44.entities.Prospect.list('-created_date', 100);
      return [];
    },
    initialData: []
  });

  const chartData = Object.entries(
    rawData.reduce((acc, item) => {
      const key = item[metric] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label outerRadius={100} fill="#8884d8" dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

function DataTableComponent({ dataSource, columns }) {
  const { data = [] } = useQuery({
    queryKey: [dataSource],
    queryFn: async () => {
      if (dataSource === 'prospects') return await base44.entities.Prospect.list('-created_date', 20);
      if (dataSource === 'projects') return await base44.entities.Project.list('-created_date', 20);
      return [];
    },
    initialData: []
  });

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th key={col} className="text-left p-3 font-semibold text-gray-900">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="p-3 text-gray-700">{row[col] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function StatsCardComponent({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <Card key={idx} className="p-6">
          <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}