import { PromptForm, type PromptFormProps } from "@/components/prompts";
import { render, screen } from "@/lib/test-utils";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

const refreshMock = jest.fn();
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
    push: pushMock
  })
}));

const createActionMock = jest.fn();
const updateActionMock = jest.fn();

jest.mock("@/app/actions/prompt.actions", () => ({
  createPromptAction: (...args: unknown[]) => createActionMock(...args),
  updatePromptAction: (...args: unknown[]) => updateActionMock(...args)
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

function makeSut({ prompt }: PromptFormProps = {} as PromptFormProps) {
  return render(<PromptForm prompt={prompt} />);
}

describe("PromptForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    refreshMock.mockReset();
    pushMock.mockReset();
    createActionMock.mockReset();
    updateActionMock.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });

  it("should create a new prompt and redirect to the new prompt page", async () => {
    createActionMock.mockResolvedValueOnce({ success: true, message: "Prompt criado com sucesso!", id: "new-id" });
    makeSut();

    const titleInput = screen.getByPlaceholderText("Título do prompt");
    const contentInput = screen.getByPlaceholderText("Digite o conteúdo do prompt...");
    const submitButton = screen.getByRole("button", { name: /salvar/i });

    await user.type(titleInput, "Novo prompt");
    await user.type(contentInput, "Este é um novo prompt");

    await user.click(submitButton);

    expect(createActionMock).toHaveBeenCalledTimes(1);
    expect(createActionMock).toHaveBeenCalledWith({
      title: "Novo prompt",
      content: "Este é um novo prompt"
    });

    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Prompt criado com sucesso!");

    expect(pushMock).toHaveBeenCalledWith("/new-id");
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("should display an error message when prompt creation fails", async () => {
    createActionMock.mockResolvedValueOnce({ success: false, message: "Erro ao criar prompt!" });
    makeSut();

    const titleInput = screen.getByPlaceholderText("Título do prompt");
    const contentInput = screen.getByPlaceholderText("Digite o conteúdo do prompt...");
    const submitButton = screen.getByRole("button", { name: /salvar/i });

    await user.type(titleInput, "Novo prompt");
    await user.type(contentInput, "Este é um novo prompt");

    await user.click(submitButton);

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Erro ao criar prompt!");
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("should display validation errors", async () => {
    makeSut();

    const submitButton = screen.getByRole("button", { name: /salvar/i });

    await user.click(submitButton);

    expect(screen.getByText("Title is required")).toBeVisible();
    expect(screen.getByText("Content is required")).toBeVisible();
    expect(createActionMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("should update an existing prompt with success", async () => {
    updateActionMock.mockResolvedValueOnce({ success: true, message: "Prompt atualizado com sucesso!" });

    const now = new Date();

    const prompt = {
      id: "1",
      title: "Título do prompt antigo",
      content: "Conteúdo do prompt antigo",
      createdAt: now,
      updatedAt: now
    };

    makeSut({ prompt });

    const titleInput = screen.getByPlaceholderText("Título do prompt");
    const contentInput = screen.getByPlaceholderText("Digite o conteúdo do prompt...");

    await user.clear(titleInput);
    await user.clear(contentInput);

    await user.type(titleInput, "Título do prompt atualizado");
    await user.type(contentInput, "Conteúdo do prompt atualizado");

    const submitButton = screen.getByRole("button", { name: /salvar/i });
    await user.click(submitButton);

    expect(updateActionMock).toHaveBeenCalledTimes(1);
    expect(updateActionMock).toHaveBeenCalledWith({
      id: prompt.id,
      title: "Título do prompt atualizado",
      content: "Conteúdo do prompt atualizado"
    });

    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Prompt atualizado com sucesso!");

    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
