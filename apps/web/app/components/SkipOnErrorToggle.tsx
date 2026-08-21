import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { useVenueSlug } from '~/hooks/useVenueSlug';
import {
  useUpdateVenueSettings,
  useVenueSettings,
} from '~/hooks/useVenueSettings';

export const SkipOnErrorToggle = () => {
  const slug = useVenueSlug();
  const { data } = useVenueSettings(slug);
  const update = useUpdateVenueSettings(slug);

  const skipOnError = data?.skipOnError ?? true;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <Checkbox
              checked={skipOnError}
              onCheckedChange={(checked) =>
                update.mutate(Boolean(checked))
              }
            />
            <span className="text-muted-foreground">Saltar si hay error</span>
          </label>
        }
      />
      <TooltipContent>
        Al desactivarlo, un video con error no avanza solo a la siguiente
        canción.
      </TooltipContent>
    </Tooltip>
  );
};
