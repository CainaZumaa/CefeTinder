import { pool } from "./src/config/database";

async function testConnection() {
  try {
    console.log("Testando conexão com o banco PostgreSQL...");
    const dbUrl =
      process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@") ||
      "não configurada";
    console.log(`Connection string: ${dbUrl}`);

    // Testa a conexão
    const client = await pool.connect();
    console.log("Conexão estabelecida com sucesso");

    // Testa uma query simples
    const result = await client.query(
      "SELECT version(), current_database(), current_user"
    );

    console.log("\nInformações do banco de dados:");
    const versionParts = result.rows[0].version.split(" ");
    console.log(`  Versão PostgreSQL: ${versionParts[0]} ${versionParts[1]}`);
    console.log(`  Banco atual: ${result.rows[0].current_database}`);
    console.log(`  Usuário: ${result.rows[0].current_user}`);

    // Verifica se as tabelas existem
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(
      `\nTabelas encontradas no schema public (${tablesResult.rows.length}):`
    );
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log("  Nenhuma tabela encontrada no schema public");
    }

    client.release();
    console.log("\nTeste de conexão concluído com sucesso");
    process.exit(0);
  } catch (error: any) {
    console.error("\nErro ao conectar com o banco de dados:");
    console.error(`  ${error.message}`);
    if (error.code) {
      console.error(`  Código do erro: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
