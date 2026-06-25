import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { User, Calendar, Clock, Eye, Edit3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  summary: string;
  modified_by?: string;
}

interface Props {
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  accessCount?: number;
  lastAccessedAt?: string;
  history?: HistoryEntry[];
}

export function MetadataPanel({
  author,
  createdAt,
  updatedAt,
  lastModifiedBy,
  lastModifiedAt,
  accessCount,
  lastAccessedAt,
  history,
}: Props) {
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Metadados</h3>

      <div className="space-y-3">
        {/* Author */}
        {author && (
          <Card className="p-3">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Autor</p>
                <p className="text-sm font-medium truncate">{author}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Created */}
        {createdAt && (
          <Card className="p-3">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Criado em</p>
                <p className="text-sm font-medium">{formatDate(createdAt)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Last Modified */}
        {lastModifiedAt && (
          <Card className="p-3">
            <div className="flex items-start gap-2">
              <Edit3 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Última edição</p>
                <p className="text-sm font-medium">
                  {formatDate(lastModifiedAt)}
                </p>
                {lastModifiedBy && (
                  <p className="text-xs text-muted-foreground mt-1">
                    por {lastModifiedBy}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Access Info */}
        {accessCount !== undefined && (
          <Card className="p-3">
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Acessos</p>
                <p className="text-sm font-medium">{accessCount} vez{accessCount !== 1 ? "es" : ""}</p>
                {lastAccessedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Último acesso: {formatDate(lastAccessedAt)}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* History Timeline */}
      {history && history.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground">
            HISTÓRICO
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, idx) => (
              <div key={entry.id} className="flex gap-2 text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  {idx < history.length - 1 && (
                    <div className="w-px h-6 bg-border" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="font-medium">{entry.summary}</p>
                  <p className="text-muted-foreground">
                    {formatDate(entry.timestamp)}
                  </p>
                  {entry.modified_by && (
                    <p className="text-muted-foreground">
                      por {entry.modified_by}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
