import React from 'react'
import nookies from 'nookies'
import jwt from 'jsonwebtoken'
import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';


function ProfileRelationsBox(propriedades) {
  return(
    <ProfileRelationsBoxWrapper>
    <h2 className="smallTitle">
      {propriedades.title} ({propriedades.itens.length})
    </h2>
    <ul>
       {/* seguidores.map((itemAtual) => {
         return(
           <li key={itemAtual}>
             <a href={`https://github.com/${itemAtual}.png`} key={itemAtual.title}>
               <img src={itemAtual.image} />
               <span>{itemAtual.image}</span>
             </a>
           </li>                  
         )
       }) */}
     </ul>
   </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  const githubUser = props.githubUser;
  const [comunidades, setComunidades] = React.useState([]);

  const pessoasFavoritas = [
    'juunegreiros', 
    'omariosouto',
    'peas',
    'felipefialho',
    'marcobrunodev',
    'rafaballerini'
  ]
  
  const [seguidores, setSeguidores] = React.useState([]);
  // pagar o ARRAY de dados do GITHUB 
  React.useEffect(function() {
    fetch('https://api.github.com/users/peas/followers')
    .then(function(respostaDoServidor) {
      return respostaDoServidor.json();
    })
    .then(function(respostaCompleta) {
      setSeguidores(respostaCompleta)
    })

    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `45501166f8489814d2b483583b5b4f`,
      },
      body: JSON.stringify({
        "query": `query {
          allCommunities {
            title
            id
            imageUrl
            creatorSlug 
          }
        }`
      }),
    })
    .then((response) => response.json())  // Pega o retorno do response.json() e ja retorna
    .then((respostaCompleta) => {
      const comunidadesVindasDoDato = respostaCompleta.data.allCommunities
      console.log(comunidadesVindasDoDato)
      setComunidades(comunidadesVindasDoDato)    
    })

  }, [])

  function ProfileSidebar(propriedades) {
    return(
      <Box as="aside">
        <img src={`https://github.com/${propriedades.githubUser}.png`} style={{ borderRadius: '8px' }}/> 
        <hr />
        <p>
          <a className="boxlink" href={`https://github.com/${propriedades.githubUser}.png`} >
            @{propriedades.githubUser}
          </a>
        </p>
        
        <hr />

        <AlurakutProfileSidebarMenuDefault />
      </Box>
    )
  }

  return (
    <>      
      <AlurakutMenu  img src={`https://github.com/${githubUser}.png`} style={{ borderRadius: '8px' }} />  

      <MainGrid>
        <div className= "profileArea" style={{ gridArea: 'profileArea' }} >
          <Box>
            <ProfileSidebar githubUser={githubUser} />
          </Box>          
        </div>        
        <div className= "welcomeArea" style={{ gridArea: 'welcomeArea'}}>
          <Box>
            <h1 className='title'>
              Bem vindo(a)
            </h1>            
            <OrkutNostalgicIconSet />
          </Box>
          <Box>
            <h2 className="subTitle">O que voce deseja fazer ?</h2>
            <form onSubmit={function handleCriaComunidade(e) {
              e.preventDefault();
              const dadosDoform = new FormData(e.target);             
              const comunidade = {
                title:dadosDoform.get('title'),
                imageUrl:dadosDoform.get('image'),
                creatorSlug: githubUser,
              }

              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type' : 'application/JSON'
                },
                body: JSON.stringify(comunidade)
              })
              .then(async (response) => {
                const dados = await response.JSON();
                console.log(dados.registroCriado);
                const comunidades = dados.registroCriado;
                const comunidadesAtualizadas = [...comunidades, comunidade];
                setComunidades(comunidadesAtualizadas)
              })
             
            }}>
              <div>
                <input 
                  placeholder="Qual vai ser o nome da sua comunidade?" 
                  name="title" 
                  aria-label="Qual vai ser o nome da sua comunidade?" 
                  type="text" 
                />
              </div>
              <div>
                <input 
                  placeholder="Coloque uma URL para usarmos de capa" 
                  name="image" 
                  aria-label="Coloque uma URL para usarmos de capa" 
                  type="text" 
                />
              </div>  

              <button>
                Criar comunidade
              </button>           
            </form>
          </Box>
        </div>        
        <div className= "profileRelationsArea" style={{ gridArea: 'profileRelationsArea'}}>
        
          <ProfileRelationsBox title="Seguidores" itens={seguidores} />

          <ProfileRelationsBoxWrapper>
           <h2 className="smallTitle">
              Comunidades ({comunidades.length})
           </h2>
           <ul>
              {comunidades.map((itemAtual) => {
                return(
                  <li key={itemAtual.id}>
                    <a href={`/communities/${itemAtual.id}`}>
                      <img src={itemAtual.imageUrl} />
                      <span>{itemAtual.title}</span>
                    </a>
                  </li>                  
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>

          <ProfileRelationsBoxWrapper >
            <h2 className="smallTitle">
              Pessoas da comunidade ({pessoasFavoritas.length})
            </h2>
            
            <ul>
              {pessoasFavoritas.map((itemAtual) => {
                return(
                  <li key={itemAtual}>
                    <a href={`/users/${itemAtual}`} key={itemAtual}>
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>                  
                )
              })}
            </ul>
            
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>

  )
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context)
  const token = cookies.USER_TOKEN;
  
  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
  .then((resposta) => resposta.json())

  console.log('isAuthenticated ', isAuthenticated);

  if(!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  const { githubUser } = jwt.decode(token);
  
  return {
    props: { 
      githubUser:githubUser
    }, // Will be passed to the page component as props
  }
}