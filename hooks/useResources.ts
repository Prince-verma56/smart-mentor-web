import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResources, deleteResource, ResourceResponse } from "@/actions/resourceActions";

export function useResources(mentorId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["resources", mentorId],
    queryFn: () => getResources(mentorId),
    refetchInterval: (query) => {
      // Poll every 3 seconds if any resource is NOT in READY, FAILED, or ARCHIVED state
      const resources = query.state.data as ResourceResponse[] | undefined;
      const hasProcessing = resources?.some(
        (r) => !["READY", "FAILED", "ARCHIVED"].includes(r.status)
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (resourceId: string) => deleteResource(mentorId, resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", mentorId] });
    },
  });

  return {
    resources: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    deleteResource: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
