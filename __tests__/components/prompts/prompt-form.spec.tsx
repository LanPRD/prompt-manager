import { PromptForm } from "@/components/prompts";
import { render, screen } from "@/lib/test-utils";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

const createActionMock = jest.fn();

jest.mock("@/app/actions/prompt.actions", () => ({
  createPromptAction: (...args: unknown[]) => createActionMock(...args)
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

function makeSut() {
  return render(<PromptForm />);
}

describe("PromptForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    refreshMock.mockReset();
    createActionMock.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });

  it("should create a new prompt", async () => {
    createActionMock.mockResolvedValueOnce({ success: true, message: "Prompt criado com sucesso!" });
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

    expect(refreshMock).toHaveBeenCalledTimes(1);
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
});
