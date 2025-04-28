export const emailTemplate = (companyName, randomPassword) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bem-vindo ao Obra Fácil</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            height: auto;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .password-box {
            background-color: #e9f7fe;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            user-select: all;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 30px;
        }
        .text {
            color: #fbb22f;
        }
        .bodyText {
            color: #023d79;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="bodyText">
          <span class="text">Obra</span> Fácil
        </h1>
    </div>
    
    <div class="content">
        <p>Você foi adicionado à empresa <strong>${companyName}</strong>.</p>
        <p>Para acessar nossa plataforma, basta baixar nosso app e inserir seu e-mail e a senha temporária abaixo:</p>
        
        <div class="password-box" onclick="navigator.clipboard.writeText('${randomPassword}')">
            ${randomPassword}
        </div>
        
        <p>Recomendamos que você altere esta senha após o primeiro acesso.</p>
    </div>
    
    <div class="footer">
        <p>Esta mensagem foi enviada automaticamente, por favor não responda.</p>
        <p>© ${new Date().getFullYear()} Obra Fácil. Todos os direitos reservados.</p>
    </div>
</body>
</html>
`;
