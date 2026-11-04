# Minha Garagem: como publicar (cerca de 15 minutos, tudo gratuito)

O app tem duas partes, e as duas são gratuitas:

| Parte | Serviço | Para quê |
|---|---|---|
| Banco de dados e login | **Firebase** (Google), plano Spark | Guarda seus dados e exige senha |
| Site | **GitHub Pages** | Hospeda os arquivos e gera o link |

> Use sua **conta pessoal** (Gmail e GitHub pessoais), não a conta corporativa. Assim o app é só seu e continua funcionando mesmo se você mudar de empresa.

Antes de configurar, você pode abrir o `index.html` num servidor local para testar. Sem configuração, o app roda em **modo demonstração**, com dados de exemplo salvos só no navegador.

---

## Passo 1: criar o projeto no Firebase

1. Acesse **https://console.firebase.google.com** com seu Gmail pessoal.
2. Clique em **Criar projeto**, dê o nome `minha-garagem` e desative o Google Analytics (não é necessário).
3. Mantenha o plano **Spark (gratuito)**. Não é preciso cadastrar cartão.

## Passo 2: ativar o login

1. No menu lateral, vá em **Criação > Authentication > Vamos começar**.
2. Em **Método de login**, ative **E-mail/senha** e salve.
3. Na aba **Usuários**, clique em **Adicionar usuário** e informe seu e-mail e uma senha forte. É com eles que você vai entrar no app.
4. *(Recomendado)* Em **Configurações > Ações do usuário**, desmarque **Ativar criação (inscrição)** para que ninguém mais crie contas no seu projeto.

## Passo 3: criar o banco de dados

1. No menu lateral, vá em **Criação > Firestore Database > Criar banco de dados**.
2. Local: **southamerica-east1 (São Paulo)**. Modo: **produção**.
3. Abra a aba **Regras**, apague o conteúdo, cole o conteúdo do arquivo `firestore.rules` e clique em **Publicar**.
   Com essas regras, cada usuário logado só acessa os próprios dados.

## Passo 4: pegar a configuração do app

1. Clique na engrenagem **Configurações do projeto > Geral**.
2. Em **Seus apps**, clique no ícone **`</>`** (Web), registre o app como `minha-garagem` e deixe o "Firebase Hosting" desmarcado.
3. O console mostra um bloco `const firebaseConfig = { apiKey: "...", ... }`.
4. Abra o arquivo **`config.js`** num editor (pode ser o Bloco de Notas) e substitua os campos pelos valores mostrados. Salve.

> A `apiKey` do Firebase **não é uma senha**. Ela pode ficar pública. Quem protege seus dados são o login e as regras do Passo 3.

## Passo 5: publicar no GitHub Pages

1. Crie uma conta em **https://github.com**, se ainda não tiver.
2. Clique em **New repository**, use o nome `minha-garagem`, deixe como **Public** e clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file**, arraste **todos os arquivos desta pasta** (com o `config.js` já preenchido) e clique em **Commit changes**.
4. Vá em **Settings > Pages**. Em *Source*, escolha **Deploy from a branch**, depois **main** e **/(root)**, e clique em **Save**.
5. Em 1 ou 2 minutos, o app estará em:
   **`https://SEU-USUARIO.github.io/minha-garagem/`**

## Passo 6: autorizar o domínio no Firebase

No Firebase, vá em **Authentication > Configurações > Domínios autorizados > Adicionar domínio** e informe `SEU-USUARIO.github.io`.

## Passo 7: instalar no celular

Abra o link no celular e faça login. Depois:

- **Android (Chrome):** menu ⋮ > **Instalar app** (ou **Adicionar à tela inicial**)
- **iPhone (Safari):** botão Compartilhar > **Adicionar à Tela de Início**

O app abre em tela cheia, como um aplicativo. **Funciona sem internet:** o que você lançar offline é sincronizado quando o sinal voltar.

---

## Como usar

- **Início:** alertas (manutenções e vencimentos próximos ou vencidos), km atual, gasto no ano e consumo de cada veículo.
- **Manutenção > Histórico:** tudo o que foi feito, com data, km, custo e oficina.
- **Manutenção > Planos e lembretes:** intervalos por km e/ou meses (o que vencer primeiro). Ao cadastrar um veículo, o app oferece planos padrão. **Confira os intervalos no manual do seu veículo**, porque os valores sugeridos são genéricos. Quando você registra uma manutenção com o mesmo nome do plano, o plano é atualizado sozinho.
- **Vencimentos:** licenciamento, IPVA (inclusive parcelas), seguro e multas. Os botões "Marcar como pago" e "Agenda" criam um evento com lembrete 7 dias e 1 dia antes. Já "Criar p/ próximo ano" duplica o vencimento com a data seguinte.
- **Combustível:** registre cada abastecimento marcando **"Encheu o tanque"** para o app calcular o consumo (km/l) entre dois tanques cheios.
- **Custos:** total por ano, por categoria, por veículo, por mês e por tipo de manutenção.
- **Configurações** (ícone no canto superior): veículos, **backup** (exportar/importar .json) e sair.

## Atualizar o app no futuro

Para alterar algo, edite os arquivos e envie de novo pelo GitHub (**Add file > Upload files**, substituindo os antigos). Os dados não são afetados, porque ficam no Firebase.

## Limites do plano gratuito

O plano Spark do Firebase não exige cartão e, diferente de alternativas como o Supabase, **não pausa o projeto por inatividade**. As cotas (1 GB de dados, 50 mil leituras e 20 mil gravações por dia) ficam muito acima do uso de 3 veículos. Como qualquer serviço gratuito, as condições podem mudar no futuro. Por isso, **exporte um backup de vez em quando** (Configurações > Exportar backup).

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Página e visual |
| `app.js` | Funcionamento do app |
| `config.js` | **Sua** configuração do Firebase (único arquivo que você edita) |
| `firestore.rules` | Regras de segurança (colar no console do Firebase) |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Instalação no celular e funcionamento offline |
