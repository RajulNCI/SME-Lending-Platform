import { useState, useCallback } from 'react';

export interface UF {
  file: File;
  id: string;
}

const MAX = 20;
const ACCEPTED = ['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png'];

export function useDocumentUpload() {
  const [files, setFiles] = useState<UF[]>([]);
  const [fErr, setFErr] = useState('');
  const [drag, setDrag] = useState(false);

  const addFiles = useCallback((list: FileList | File[]) => {
    const arr = Array.from(list);
    const errs: string[] = [];
    const valid = arr.filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        errs.push(`${f.name}: invalid format`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        errs.push(`${f.name}: exceeds 10MB`);
        return false;
      }
      return true;
    });
    
    setFiles((p) => {
      const nx = [
        ...p,
        ...valid.map((f) => ({ file: f, id: Math.random().toString(36).slice(2) })),
      ];
      if (nx.length > MAX) {
        errs.push(`Max ${MAX} documents`);
        return nx.slice(0, MAX);
      }
      return nx;
    });
    setFErr(errs[0] || '');
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((p) => p.filter((f) => f.id !== id));
  }, []);

  return { files, setFiles, fErr, setFErr, drag, setDrag, addFiles, onDrop, removeFile, MAX, ACCEPTED };
}
