export class UpdateMessageUseCase {
    constructor(private repository: any) {}

    async execute(messageId: string, newContent: string): Promise<any> {
        console.log(`Atualizando mensagem ${messageId}: ${newContent}`);
        return { id: messageId, content: newContent, updated: true };
    }
}
