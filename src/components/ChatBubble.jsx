// Burbuja de un mensaje.
// Los propios van a la derecha en naranja; los recibidos, a la izquierda en blanco.
export default function ChatBubble({ texto, fecha, hora, esPropio, autor }) {
  return (
    <li className={`flex ${esPropio ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%] ${
          esPropio
            ? 'rounded-br-md bg-home-orange-500 text-white'
            : 'rounded-bl-md border border-home-orange-100 bg-white text-gray-900'
        }`}
      >
        {/* Los lectores de pantalla anuncian quién escribió cada mensaje */}
        <span className="sr-only">{esPropio ? 'Tú:' : `${autor}:`}</span>

        {/* whitespace-pre-wrap respeta los saltos de línea; overflow-wrap evita que un enlace largo rompa la burbuja */}
        <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">{texto}</p>

        <time
          dateTime={fecha}
          className={`mt-1 block text-right text-xs ${esPropio ? 'text-home-orange-100' : 'text-gray-600'}`}
        >
          {hora}
        </time>
      </div>
    </li>
  )
}