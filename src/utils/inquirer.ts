type PromptArguments = [
  questions: unknown,
  answers?: unknown,
  options?: unknown,
];

let cachedInquirer:
  | { prompt: (...args: PromptArguments) => Promise<unknown> }
  | undefined;

const loadInquirer = async (): Promise<{
  prompt: (...args: PromptArguments) => Promise<unknown>;
}> => {
  if (!cachedInquirer) {
    const module = await import('inquirer');
    cachedInquirer = module.default;
  }

  return cachedInquirer;
};

export const prompt = async <T = Record<string, any>>(
  ...args: PromptArguments
): Promise<T> => {
  const inquirer = await loadInquirer();
  return (await inquirer.prompt(...args)) as T;
};
