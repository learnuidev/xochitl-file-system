export type StageTypes = "dev" | "test" | "prod";

export const allowedStages: Record<StageTypes, StageTypes> = {
  dev: "dev",
  test: "test",
  prod: "prod",
};
