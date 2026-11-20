ZYRO PODEPA
===========

Arquivos:
- podepa.html
- podepa.css
- podepa.js

IMPORTANTE:
O podepa.js usa o Firebase que já existe no seu projeto:
./firebase.js

O arquivo precisa exportar:
auth
db
storage

Exemplo de import esperado:
import { auth, db, storage } from "./firebase.js";

Cole os 3 arquivos na pasta principal do seu site.

Cole também o link:
<a href="podepa.html">ZYRO PODEPA</a>

O chat usa:
- Firestore para mensagens e conversas privadas
- Storage para fotos
- Firebase Authentication para identificar usuários

Coleções:
zyroPodepaMensagens
zyroPodepaConversas/{conversationId}/mensagens

Atenção:
As regras de Firestore e Storage devem permitir essas coleções/caminhos no seu projeto Firebase.
