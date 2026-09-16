// =========================================
// GESTOK - FIREBASE AUTHENTICATION
// FIREBASE É A ÚNICA AUTENTICAÇÃO
// =========================================

const auth = firebase.auth();

function usuarioFirebaseAtual() {
    return auth.currentUser || null;
}

function uidUsuarioAtual() {
    return usuarioFirebaseAtual()?.uid || null;
}

function usuarioEstaLogado() {
    return !!usuarioFirebaseAtual();
}

function observarUsuarioFirebase(callback) {
    return auth.onAuthStateChanged(callback);
}

async function loginFirebase(email, senha) {
    const resultado =
        await auth.signInWithEmailAndPassword(email, senha);
    return resultado.user;
}

async function cadastrarUsuarioFirebase(email, senha) {
    const resultado =
        await auth.createUserWithEmailAndPassword(email, senha);
    return resultado.user;
}

async function sairFirebase() {
    await auth.signOut();
}

function mensagemErroFirebase(erro) {
    const mapa = {
        'auth/email-already-in-use':
            'Este e-mail já está cadastrado.',
        'auth/invalid-email':
            'O e-mail informado é inválido.',
        'auth/weak-password':
            'A senha precisa ter pelo menos 6 caracteres.',
        'auth/user-not-found':
            'Código da Loja ou usuário incorreto.',
        'auth/wrong-password':
            'Senha incorreta.',
        'auth/invalid-credential':
            'Código da Loja, usuário ou senha incorretos.',
        'auth/too-many-requests':
            'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
        'auth/network-request-failed':
            'Falha de conexão. Verifique sua internet.',
        'auth/operation-not-allowed':
            'O login por e-mail e senha não está ativado no Firebase.'
    };

    return (
        mapa[erro?.code] ||
        erro?.message ||
        'Não foi possível concluir a operação. Tente novamente.'
    );
}
