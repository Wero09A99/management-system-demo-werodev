import {
  Pagination as ShadPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

/**
 * Molécula Pagination genérica.
 */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <ShadPagination className={cn("justify-end", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            aria-disabled={page <= 1}
            aria-label="Página anterior"
            className={cn(page <= 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(p);
              }}
              isActive={p === page}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            aria-disabled={page >= totalPages}
            aria-label="Página siguiente"
            className={cn(page >= totalPages && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadPagination>
  );
}