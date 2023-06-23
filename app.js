const getTypeColor = (type) => {
  const normal = '#F5F5F5'
  return (
    {
      normal,
      fire: '#FDDFDF',
      grass: '#DEFDE0',
      electric: '#FCF7DE',
      ice: '#DEF3FD',
      water: '#DEF3FD',
      ground: '#F4E7DA',
      rock: '#D5D5D4',
      fairy: '#FCEAFF',
      poison: '#98D7A5',
      bug: '#F8D5A3',
      ghost: '#CAC0F7',
      dragon: '#97B3E6',
      psychic: '#EAEDA1',
      fighting: '#E6E0D4',
    }[type] || normal
  )
}

/*O que eu quero fazer quando essa pagina for carregada?
Eu quero buscar os pogemos e renderizar os pokemons na tela
*/
const getOnlyFulfilled = async ({ func, arr }) => {
  const promises = arr.map(func)
  const responses = await Promise.allSettled(promises)
  return responses.filter((response) => response.status === 'fulfilled')
}

const getPokemonsType = async (pokeApiResults) => {
  const fulfilled = await getOnlyFulfilled({
    arr: pokeApiResults,
    func: (result) => fetch(result.url),
  })
  const pokePromises = fulfilled.map((url) => url.value.json())
  const pokemons = await Promise.all(pokePromises)
  return pokemons.map((fulfilled) =>
    fulfilled.types.map((info) => DOMPurify.sanitize(info.type.name))
  )
}

const getPokemonsIds = (pokeApiResults) =>
  pokeApiResults.map(({ url }) => {
    const urlAsArray = DOMPurify.sanitize(url.split('/'))
    return urlAsArray.at(urlAsArray.length - 2)
  })

const getPokemonsImgs = async (ids) => {
  const fulfilled = await getOnlyFulfilled({
    arr: ids,
    func: (id) => fetch(`./assets/img/${id}.png`), //Aqui não precisa utilizar o DOMPurify pois ele
    //não está acessando uma aplicação externa e sim um diretorio interno com as imagens. Aqui nos
    //temos controle dos arquivos e pastas retornadas
  })
  return fulfilled.map((response) => response.value.url)
}

const getPokemons = async () => {
  try {
    const response = await fetch(
      'https://pokeapi.co/api/v2/pokemon?limit=15&offset=0'
    )

    if (!response.ok) {
      throw new Error('Não foi possível obter as informações')
    }

    const { results: pokeApiResults } = await response.json()
    const types = await getPokemonsType(pokeApiResults)
    const ids = getPokemonsIds(pokeApiResults)
    const imgs = await getPokemonsImgs(ids)
    const pokemons = ids.map((id, i) => ({
      id,
      name: pokeApiResults[i].name,
      types: types[i],
      imgUrl: imgs[i],
    }))

    return pokemons
  } catch (error) {
    console.log('algo deu errado', error)
  }
}

const renderPokemons = (pokemons) => {
  const ul = document.querySelector('[data-js="pokemons-list"]')
  pokemons.forEach(({ id, name, types, imgUrl }) => {
    const li = document.createElement('li')
    const img = document.createElement('img')
    const nameContainer = document.createElement('h2')
    const typeContainer = document.createElement('p')
    const [firstType] = types

    img.setAttribute('src', imgUrl)
    img.setAttribute('alt', name)
    li.setAttribute('class', `card ${firstType}`)
    li.style.setProperty('--type-color', getTypeColor(firstType))

    nameContainer.textContent = `${id}. ${name[0].toUpperCase()}${name.slice(
      1
    )}`
    typeContainer.textContent = types.length > 1 ? types.join('|') : firstType
    li.append(img, nameContainer, typeContainer)

    console.log(li)
  })
}

const handlePageLoaded = async () => {
  const pokemons = await getPokemons()
  renderPokemons(pokemons)
}

handlePageLoaded()
