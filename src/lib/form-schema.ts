import * as schema from "@/lib/schema";

export const addHostFormSchema = schema.hostSchema.pick({ name: true, height: true });
