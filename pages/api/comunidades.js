import SiteClient  from 'datocms-client';

export default async function recebedorDeRequests(request, response) {

  if(request.method === 'POST') {

    const TOKEN = '5c0bf959eddd4d8ad8d6754fa5c47d';
    const client = new SiteClient(TOKEN);

    // importante : validar os dados antes de sair cadastrando
    const registroCriado = await client.items.create({
      itemType: "972775", // model ID: id do model "Communities" criado pelo Dato
      ...request.body,

    })
  
    console.log(registroCriado);

    response.json({
      registroCriado: registroCriado,
    })
    return;
  }

  response.status(404).json({
    message: 'Ainda nao temos nada no GET, mas no POST tem!'
  })
  
}