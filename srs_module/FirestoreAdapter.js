import { 
    getFirestore, collection, query, where, orderBy, limit, getDocs, doc, updateDoc, addDoc, Timestamp 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js"; 
// ※ バージョンは既存アプリに合わせて調整してください

const db = getFirestore(); // 既存アプリで初期化済みのFirestoreインスタンスを取得

/**
 * 学習すべきカードを取得する（今日やる分 + 新規）
 */
export async function getDueCards(userId, deckId, limitCount = 20) {
    const cardsRef = collection(db, `users/${userId}/cards`);
    const now = Date.now();

    // 1. 期日が来ているReview/Learningカードを取得
    // 複合インデックスが必要になります: deckId ASC, due ASC
    const q = query(
        cardsRef,
        where("deckId", "==", deckId),
        where("due", "<=", now),
        orderBy("due", "asc"),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id,...doc.data() }));
}

/**
 * カードの結果を保存する
 */
export async function updateCard(userId, cardId, updates, reviewLog) {
    const cardRef = doc(db, `users/${userId}/cards/${cardId}`);
    const logRef = collection(db, `users/${userId}/review_logs`);

    // カード状態の更新
    await updateDoc(cardRef, updates);

    // ログの保存（分析用）
    if (reviewLog) {
        await addDoc(logRef, {
           ...reviewLog,
            cardId,
            reviewedAt: Timestamp.now()
        });
    }
}
//...既存のコードの下に追記...

/**
 * 新しいカードを追加する（テスト用・本番用共通）
 */
export async function addCard(userId, deckId, frontText, backText) {
    const cardsRef = collection(db, `users/${userId}/cards`);
    await addDoc(cardsRef, {
        deckId: deckId,
        front: frontText,
        back: backText,
        state: 'new',       // 新規カードとして登録
        due: Date.now(),    // すぐに学習可能にする
        interval: 0,
        ease: 2.5,
        lapses: 0,
        stepIndex: 0
    });
}
//...既存のコードの下に追記...

/**
 * 新しいカードを追加する（テスト用）
 */
export async function addCard(userId, deckId, frontText, backText) {
    // ユーザーのカードコレクションへの参照
    const cardsRef = collection(db, `users/${userId}/cards`);
    
    await addDoc(cardsRef, {
        deckId: deckId,
        front: frontText,
        back: backText,
        state: 'new',       // 新規カード
        due: Date.now(),    // すぐに学習可能にする
        interval: 0,
        ease: 2.5,
        lapses: 0,
        stepIndex: 0
    });
}
