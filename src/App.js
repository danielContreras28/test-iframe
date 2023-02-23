/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect } from 'react'
import * as jose from 'jose'
import { ConfigHooks, hooksNumber } from 'hooks-now'
import './App.css'
import mockata from './data.mock.json'

function App() {
  const iframeRef = useRef(null)
  const id = '2de8cd3e-f1fe-45bc-99b4-51c3db493603'
  const url = `http://localhost/token-loader`
  const urlRediret = `http://localhost/clientes/${id}`
  const [PublicKey, setPublicKey] = useState()
  const [PrivateKey, setPrivateKey] = useState()
  const [PublicKJWT, setPublicKJWT] = useState()
  const [JWTState, setJWTState] = useState()

  const alg = 'PS256'
  const transmition = {
    ...mockata,
    urlRediret,
  }

  const publicKeyJWT = async (publicKey) => {
    const spkiPem = await jose.exportSPKI(publicKey)
    setPublicKJWT(spkiPem)
  }

  const init = async () => {
    const { publicKey, privateKey } = await jose.generateKeyPair(alg)
    setPublicKey(publicKey)
    setPrivateKey(privateKey)
  }

  const createJWT = async () => {
    const jwt = await new jose.SignJWT({ transmition })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(PrivateKey)

    setJWTState(jwt)
  }

  const message = () => {
    console.log(hooksNumber.useFormateNumber(25780.97))
  }

  useEffect(() => {
      init()
      ConfigHooks({
        decimals: 2,
        decPoint: '.',
        thousandsSep: ',',
        currencyDefault: 'COL'
      })
      message()
  }, [])

  useEffect(() => {
    if (typeof PublicKey === 'object' && PublicKey !== null) {
      publicKeyJWT(PublicKey)
    }
    if (typeof PrivateKey === 'object' && PrivateKey !== null) {
      createJWT(PrivateKey)
    }
  }, [PublicKey, PrivateKey])

  useEffect(() => {
    if(iframeRef && JWTState){
      iframeRef.current.contentWindow.postMessage({
        action: 'authToken',
        jwt: JWTState,
        publicKey: PublicKJWT
      }, url)
    }
  }, [JWTState])
  

  return (
    <div className="App">
      <button onClick={message}> test </button>
      <iframe
      ref={iframeRef}
      onLoad={init}
      className="iframe"
      title='test'
      src={url} />
    </div>
  );
}

export default App;
