import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rfiApi } from "@/components/services/rfiApiClient";
import RFIList from "@/components/rfi/RFIList";
import RFIForm from "@/components/rfi/RFIForm";
import RFIView from "@/components/rfi/RFIView";

export default function RFIs() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  const { data: rfis = [], refetch } = useQuery({
    queryKey: ['rfis_all'],
    queryFn: () => rfiApi.list({}, '-updated_date', 50)
  });

  const createRFI = useMutation({
    mutationFn: (payload) => rfiApi.create(payload),
    onSuccess: () => {
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ['rfis_all'] });
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {!showForm && (
        <RFIList onCreate={() => setShowForm(true)} onOpen={(r)=> setSelected(r)} />
      )}
      {showForm && (
        <RFIForm onCancel={() => setShowForm(false)} onSubmit={(data)=> createRFI.mutate(data)} />
      )}
      {selected && (
        <RFIView rfi={selected} onRefresh={() => { refetch(); }} />
      )}
    </div>
  );
}