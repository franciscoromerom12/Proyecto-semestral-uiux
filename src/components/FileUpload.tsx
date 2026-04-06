import { useCallback, useState } from "react";
import { useStore } from "@/lib/store";
import { parseFile } from "@/lib/file-parser";
import { Upload, FileSpreadsheet, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FileUpload() {
  const { state, setVolunteers } = useStore();
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setErrors([]);
    const { volunteers, errors } = await parseFile(file);
    if (errors.length > 0 && volunteers.length === 0) {
      setErrors(errors);
      return;
    }
    if (errors.length > 0) {
      setErrors(errors);
    }
    const merged = [...state.volunteers, ...volunteers];
    const unique = merged.filter((v, i, arr) => arr.findIndex(x => x.correo === v.correo) === i);
    setVolunteers(unique);
    toast.success(`${volunteers.length} voluntarios cargados correctamente`);
  }, [state.volunteers, setVolunteers]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-2">Arrastra un archivo Excel o CSV aquí</p>
        <label>
          <Button variant="outline" asChild>
            <span>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Seleccionar archivo
            </span>
          </Button>
          <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={onFileInput} />
        </label>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-1">
          <div className="flex items-center gap-2 text-destructive font-medium">
            <AlertTriangle className="h-4 w-4" />
            Errores encontrados
          </div>
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-destructive/80 pl-6">{err}</p>
          ))}
        </div>
      )}

      {state.volunteers.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-status-assigned-foreground bg-status-assigned-bg rounded-lg p-3">
          <Check className="h-4 w-4" />
          {state.volunteers.length} voluntarios en la base de datos
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Columnas requeridas:</p>
        <p>nombre, correo, sexo, universidad, carrera, zona_preferida, timestamp</p>
      </div>
    </div>
  );
}
