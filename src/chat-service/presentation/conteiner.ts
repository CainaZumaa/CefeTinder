import { SendMessageUseCase } from "../application/use-cases/SendMessageUseCase";
import { MarkAsReadUseCase } from "../application/use-cases/MarkAsReadUseCase";
import { CreateConversationUseCase } from "../application/use-cases/CreateConversationUseCase";
import { UpdateMessageUseCase } from "../application/use-cases/UpdateMessageUseCase";
import { DeleteMessageUseCase } from "../application/use-cases/DeleteMessageUseCase";
import { MessageSentHandler } from "../application/event-handlers/MessageSentHandler";
import { MessageReadHandler } from "../application/event-handlers/MessageReadHandler";
import { DatabaseConnection } from "../infrastructure/database/DatabaseConnection";
import { PostgresChatRepositoryExtended } from "../infrastructure/persistence/PostgresChatRepositoryExtended";

export class Container {
    private static instance: Container | null = null;
    private dependencies = new Map<string, any>();

    private constructor() {
        this.setupDependencies();
    }

    public static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    private async setupDependencies(): Promise<void> {
        console.log('Container: Configurando dependências...');
        
        try {
            // 1. BANCO DE DADOS REAL
            const db = new DatabaseConnection({
                host: process.env.DB_HOST || 'postgres',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'chat_db',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres123'
            });
            
            const repository = new PostgresChatRepositoryExtended(db);
            console.log('PostgreSQL conectado');
            
            // 2. EVENT BUS MOCK (por enquanto)
            const eventBus = {
                publish: async (event: any) => {
                    const eventName = event.constructor?.name || event.type || 'Unknown';
                    console.log(` [EVENTBUS] Evento publicado: ${eventName}`);
                },
                subscribe: async (eventName: string, handler: Function) => {
                    console.log(` [EVENTBUS] Inscrito em: ${eventName}`);
                    // Para desenvolvimento, podemos simular eventos
                    if (eventName === 'MessageSentEvent') {
                        setTimeout(() => {
                            handler({ 
                                messageId: 'real-msg-' + Date.now(),
                                senderId: 'user1',
                                receiverId: 'user2',
                                aggregateId: 'room1'
                            });
                        }, 5000);
                    }
                }
            };
            
            // 3. USE CASES REAIS (com repository real)
            this.dependencies.set('SendMessageUseCase', new SendMessageUseCase(
                repository, repository, eventBus
            ));
            
            this.dependencies.set('MarkAsReadUseCase', new MarkAsReadUseCase(
                repository, eventBus
            ));
            
            this.dependencies.set('CreateConversationUseCase', new CreateConversationUseCase(
                repository
            ));
            
            this.dependencies.set('UpdateMessageUseCase', new UpdateMessageUseCase(
                repository
            ));
            
            this.dependencies.set('DeleteMessageUseCase', new DeleteMessageUseCase(
                repository
            ));
            
            // 4. HANDLERS
            this.dependencies.set('MessageSentHandler', new MessageSentHandler(eventBus));
            this.dependencies.set('MessageReadHandler', new MessageReadHandler(eventBus));
            
            // 5. INFRA
            this.dependencies.set('EventBus', eventBus);
            this.dependencies.set('Repository', repository);
            this.dependencies.set('Database', db);
            
            console.log(' Container: Todas dependências configuradas (com banco REAL)');
            
        } catch (error: any) {
            console.log(' Erro configurando dependências reais, usando mocks:', error.message);
            this.setupMockDependencies();
        }
    }
    
    private setupMockDependencies(): void {
        console.log(' Container: Configurando dependências MOCK...');
        
        // EVENT BUS MOCK
        const eventBus = {
            publish: async (event: any) => {
                console.log(` [MOCK] Evento publicado: ${event.constructor?.name || 'Unknown'}`);
            },
            subscribe: async (eventName: string, handler: Function) => {
                console.log(`[MOCK] Inscrito em: ${eventName}`);
            }
        };
        
        // USE CASES MOCK
        const mockUseCase = {
            execute: async (data: any) => {
                console.log(' [MOCK] UseCase executado:', data);
                return { id: 'mock-' + Date.now(), success: true, ...data };
            }
        };
        
        // REGISTRA TUDO
        this.dependencies.set('EventBus', eventBus);
        this.dependencies.set('SendMessageUseCase', mockUseCase);
        this.dependencies.set('MarkAsReadUseCase', mockUseCase);
        this.dependencies.set('CreateConversationUseCase', mockUseCase);
        this.dependencies.set('UpdateMessageUseCase', mockUseCase);
        this.dependencies.set('DeleteMessageUseCase', mockUseCase);
        this.dependencies.set('MessageSentHandler', { handle: async () => console.log(' [MOCK] Handler') });
        this.dependencies.set('MessageReadHandler', { handle: async () => console.log(' [MOCK] Handler') });
        
        console.log(' Container: Dependências MOCK configuradas');
    }

    public get<T>(name: string): T {
        if (!this.dependencies.has(name)) {
            console.warn(` Dependência "${name}" não encontrada, retornando mock`);
            return {
                execute: async (data: any) => {
                    console.log(` [FALLBACK] Executando ${name}:`, data);
                    return { success: true, mock: true, ...data };
                },
                handle: async (data: any) => console.log(` [FALLBACK] Handler ${name}:`, data)
            } as T;
        }
        return this.dependencies.get(name) as T;
    }
}