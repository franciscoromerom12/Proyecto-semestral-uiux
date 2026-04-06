import { useState } from "react";
import { useStore } from "@/lib/store";
import { runAssignment } from "@/lib/assignment-engine";
import { exportToExcel } from "@/lib/file-parser";
import { Dashboard } from "@/components/Dashboard";
import { FileUpload } from "@/components/FileUpload";
import { ZoneManager } from "@/components/ZoneManager";
import { VolunteerTable } from "@/components/VolunteerTable";
import { ZoneView } from "@/components/ZoneView";
import { WaitlistView } from "@/components/WaitlistView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Download, Trash2, LayoutDashboard, Upload, MapPin, Users, Eye, Clock } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { state, updateState, resetAll } = useStore();
  const [tab, setTab] = useState("dashboard");

  const handleAssign = () => {
    if (state.volunteers.length === 0) return toast.error("No hay voluntarios cargados");
    if (state.zones.length === 0) return toast.error("No hay zonas configuradas");
    const result = runAssignment(state.volunteers, state.zones);
    updateState({ volunteers: result.volunteers, waitlist: result.waitlist });
    toast.success("Asignación completada");
    setTab("zones-view");
  };

  const handleExport = () => {
    if (state.volunteers.length === 0) return toast.error("No hay datos para exportar");
    exportToExcel(state.volunteers, state.zones);
    toast.success("Archivo exportado");
  };

  const handleReset = () => {
    resetAll();
    toast.success("Datos reiniciados");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Gestor de Voluntarios</h1>
            <p className="text-sm text-muted-foreground">Asignación automática por zonas</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAssign} className="gap-1.5">
              <Play className="h-4 w-4" />
              Asignar
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-1.5">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" className="gap-1.5"><LayoutDashboard className="h-4 w-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="upload" className="gap-1.5"><Upload className="h-4 w-4" />Cargar Datos</TabsTrigger>
            <TabsTrigger value="zones" className="gap-1.5"><MapPin className="h-4 w-4" />Zonas</TabsTrigger>
            <TabsTrigger value="volunteers" className="gap-1.5"><Users className="h-4 w-4" />Voluntarios</TabsTrigger>
            <TabsTrigger value="zones-view" className="gap-1.5"><Eye className="h-4 w-4" />Vista Zonas</TabsTrigger>
            <TabsTrigger value="waitlist" className="gap-1.5"><Clock className="h-4 w-4" />Espera</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><Dashboard /></TabsContent>
          <TabsContent value="upload"><FileUpload /></TabsContent>
          <TabsContent value="zones"><ZoneManager /></TabsContent>
          <TabsContent value="volunteers"><VolunteerTable /></TabsContent>
          <TabsContent value="zones-view"><ZoneView /></TabsContent>
          <TabsContent value="waitlist"><WaitlistView /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
