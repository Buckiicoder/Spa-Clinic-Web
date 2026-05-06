export type ProductInput = {
  product_id: number;
  quantity: number;
};

export type StepInput = {
  name: string;
  duration: number;
  products?: ProductInput[];
};

export type PhaseInput = {
  name: string;
  from_session: number;
  to_session: number;
  steps_template: StepInput[];
};

export type SavePayload = {
  phases: PhaseInput[];
};
