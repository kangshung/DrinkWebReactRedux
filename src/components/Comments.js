import React, {useEffect} from 'react';
import {useParams} from "react-router-dom";
import DeleteComment from './DeleteComment';
import SelectOrder from './SelectOrder';
import firebase from '../firebase';
import 'firebase/firestore';
import {useSelector, useDispatch} from 'react-redux';
import {addComment, refreshComments, commentsOrderTypes} from '../redux/actions';
import styles from '../styles/comments.module.css'


function Comments(){
  let db = firebase.firestore();
  let {drinkId} = useParams();
  const dispatch = useDispatch()
  const comments = useSelector(state => state.comments);
  const userInfo = useSelector(state => state.userInfo.userInfo);
  const commentsOrder = useSelector(state => state.commentsOrder);

  useEffect(() => {
    const unsubscribe = db.collection('comments').where('drinkId', '==', drinkId)
    .onSnapshot(function (doc){
      dispatch(refreshComments());
      doc.forEach((comment) => {
        if(doc.metadata.hasPendingWrites === false) 
          dispatch(addComment({...comment.data(), commentId: comment.id}));
      })
    });
    return () => unsubscribe();
  },[db, dispatch, drinkId])

  function SortByDateAndTime(a, b){
    if(commentsOrder === commentsOrderTypes.NEWEST_TO_OLDEST && a.createdAt.seconds > b.createdAt.seconds){
      return -1
    }
    if(commentsOrder === commentsOrderTypes.NEWEST_TO_OLDEST && a.createdAt.seconds < b.createdAt.seconds){
      return 1
    }
    if(commentsOrder === commentsOrderTypes.OLDEST_TO_NEWEST && a.createdAt.seconds > b.createdAt.seconds){
      return 1
    }
    if(commentsOrder === commentsOrderTypes.OLDEST_TO_NEWEST && a.createdAt.seconds < b.createdAt.seconds){
      return -1
    }
    if((commentsOrder === commentsOrderTypes.OLDEST_TO_NEWEST || commentsOrder === commentsOrderTypes.NEWEST_TO_OLDEST) && a.createdAt.seconds === b.createdAt.seconds){
      return 0
    }
  }

  return(
    <>
      {comments.length !== 0 && <SelectOrder/>}
      {comments.sort(SortByDateAndTime).map((comment, index) => (
        <div className={styles.commentContainer} key={index}>
          <div className={styles.info}> {comment.name} &nbsp;&nbsp; {new Date(comment.createdAt.toDate()).toLocaleString('en-GB', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} </div>
          {userInfo.uid===comment.uid && <div><DeleteComment commentId={comment.commentId}/></div>}
          <div className={styles.break}></div>
          <div className={styles.content}>{comment.content}</div>
        </div>
      ))}
    </>
  )
}

export default Comments;
