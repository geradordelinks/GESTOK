// =========================================
// GESTOK - FIREBASE AUTHENTICATION
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

function emailInternoGestok(codigoLoja, usuario) {
    const codigo = String(codigoLoja || '').trim();
    const nome = String(usuario || '').trim().toLowerCase();
    return `${codigo}.${nome}@login.gestok.local`;
}

async function loginFirebase(codigoLoja, usuario, senha) {
    const emailInterno = emailInternoGestok(codigoLoja, usuario);
    const resultado = await auth.signInWithEmailAndPassword(emailInterno, senha);
    return resultado.user;
}

async function cadastrarUsuarioFirebase(codigoLoja, usuario, senha) {
    const emailInterno = emailInternoGestok(codigoLoja, usuario);
    const resultado = await auth.createUserWithEmailAndPassword(emailInterno, senha);
    return resultado.user;
}

async function sairFirebase() {
    await auth.signOut();
}

function mensagemErroFirebase(erro) {
    const mapa = {
        'auth/email-already-in-use': 'Este usuário já está cadastrado.',
        'auth/invalid-email': 'Dados de acesso inválidos.',
        'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
        'auth/user-not-found': 'Código da Loja ou usuário incorreto.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/invalid-credential': 'Código da Loja, usuário ou senha incorretos.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns instantes e tente novamente.'
    };
    return mapa[erro?.code] || 'Não foi possível concluir a operação. Tente novamente.';
}
