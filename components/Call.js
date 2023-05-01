import SendBirdCall from 'sendbird-calls';
import React, { useState, useEffect, useRef } from 'react';
import Login from './Login';
import Dialer from './Dialer';

const Call = () => {
  const [userId, setUserId] = useState('');
  const [call, setCall] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mutedVideo, setMutedAudio] = useState(false);
  const [defaultCallParams, setDefaultCallParams] = useState({});

  const authenticate = async () => {
    try {
      const result = await new Promise((resolve, reject) => {
        SendBirdCall.authenticate({ userId }, (res, error) => {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        });
      });

      console.log(`Authenticated as ${userId}`);
      return result;
    } catch (error) {
      console.log('Error authenticating');
      throw error;
    }
  };

  const addEventHandler = () => {
    SendBirdCall.addListener(`CALLS_HANDLER_${userId}`, {
      onRinging: (call) => {
        console.log('Receiving call');
        call = setDefaultCallHandlers(call);
        setRinging(true);
        setCall(call);
      },
    });
  };

  const initiateSendbirdCalls = async () => {
    const APP_ID = process.env.NEXT_PUBLIC_APP_ID;
    SendBirdCall.init(APP_ID);

    try {
      setLoading(true);
      await authenticate();
      await SendBirdCall.connectWebSocket();
      addEventHandler();
      setAuthenticated(true);
      setLoading(false);
    } catch {
      setLoading(false);
      setAuthenticated(false);
    }
  };

  const setDefaultCallHandlers = (call) => {
    call.onEstablished = () => {
      setRinging(false);
      setConnecting(false);
      console.log('Call established');
    };
    call.onConnected = () => {
      setRinging(false);
      setConnected(true);
      setConnecting(false);
      console.log('Call connected');
      console.log(call);
    };
    call.onReconnected = () => {
      setConnected(true);
      setConnecting(false);
      console.log('Call reconnected');
    };
    call.onReconnecting = () => {
      setConnected(false);
      setConnecting(true);
      console.log('Call reconnecting');
    };
    call.onEnded = () => {
      setRinging(false);
      setConnected(false);
      setConnecting(false);
      setCall(null);
      console.log('Call ended');
    };
    call.onRemoteAudioSettingsChanged = () => {
      console.log('Remote audio settings changed');
    };
    call.onRemoteVideoSettingsChanged = () => {
      console.log('Remote video settings changed');
    };
    return call;
  };

  useEffect(() => {
    if (userId) {
      initiateSendbirdCalls();
      setDefaultCallParams({
        callOption: {
          localMediaView: document.getElementById('local_video_element_id'),
          remoteMediaView: document.getElementById('remote_video_element_id'),
          audioEnabled: true,
          videoEnabled: true,
        },
      });
    }
  }, [userId]);

  const makeCall = ({ userId, isVideoCall }) => {
    const dialParams = { ...defaultCallParams, ...{ userId, isVideoCall } };
    let call = SendBirdCall.dial(dialParams, (call, error) => {
      console.log('Dialing');
      if (error) {
        setCall(null);
      }
    });

    call = setDefaultCallHandlers(call);
    setConnecting(true);
    setCall(call);
  };

  return (
    <div className='p-10'>
      <div className='flex justify-center mt-28'>
        <>
          {userId && (
            <>
              <div className='flex flex-col items-center space-y-6'>
                <h1 className='font-bold text-xl'>Authenticated as {userId}</h1>

                {authenticated && ringing && (
                  <div className='flex flex-col items-center space-y-3'>
                    <h2 className='text-lg'>
                      {call.isVideoCall ? 'Video' : 'Audio'} Call is Ringing
                    </h2>
                    <div className='flex space-x-4'>
                      <button
                        onClick={() => {
                          call.end();
                          setRinging(false);
                        }}
                        className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded'
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          call.accept(defaultCallParams);
                          setRinging(false);
                        }}
                        className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded'
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                )}

                {authenticated && connected && (
                  <div className='flex flex-col items-center space-y-3'>
                    <h2>
                      {call.isVideoCall ? 'Video' : 'Audio'} Call is Connected
                    </h2>
                    <div className='flex space-x-4'>
                      <button
                        onClick={() => {
                          setMuted(!muted);
                          call.isLocalAudioEnabled
                            ? call.muteMicrophone()
                            : call.unmuteMicrophone();
                        }}
                        className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
                      >
                        {call.isLocalAudioEnabled
                          ? 'Mute Audio'
                          : 'Unmute Audio'}
                      </button>
                      {call.isVideoCall && (
                        <button
                          onClick={() => {
                            setMutedAudio(!mutedVideo);
                            call.isLocalVideoEnabled
                              ? call.stopVideo()
                              : call.startVideo();
                          }}
                          className='bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded'
                        >
                          {mutedVideo ? 'Enable Video' : 'Disable Video'}
                        </button>
                      )}
                      <button
                        onClick={() => call.end()}
                        className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded'
                      >
                        End Call
                      </button>
                    </div>
                  </div>
                )}

                {authenticated && connecting && (
                  <div className='flex items-center space-x-2'>
                    <div className='bg-green-400 w-[50px] h-[50px] flex justify-center items-center rounded-full'>
                      <div className='animate-spin rounded-full h-[20px] w-[20px] border-b-2 border-white'></div>
                    </div>
                    <div>Calling...</div>
                  </div>
                )}

                <div>
                  {authenticated &&
                    !ringing &&
                    !connected &&
                    !connecting &&
                    typeof window !== 'undefined' && (
                      <Dialer makeCall={makeCall} />
                    )}
                  {!loading && !authenticated && (
                    <div>
                      <h1 className='font-bold text-[20px]'>
                        Unable to authenticate as {userId}
                      </h1>
                      <Login userId={userId} setUserId={setUserId} />
                    </div>
                  )}
                </div>
                {typeof window !== 'undefined' && (
                  <div className='relative h-[700px] w-screen flex rounded-md'>
                    <video
                      className='absolute top-0 left-0 w-full h-full object-cover z-0 rounded-md'
                      id='remote_video_element_id'
                      autoPlay={true}
                      visible={call?.isVideoCall}
                      style={
                        call?.isVideoCall ? { width: '100%' } : { width: '0%' }
                      }
                    />
                    <video
                      className='absolute top-0 left-0 object-cover z-1 w-[400px] h-[250px] rounded-md'
                      id='local_video_element_id'
                      autoPlay={true}
                      visible={call?.isVideoCall}
                      style={
                        call?.isVideoCall ? { width: '30%' } : { width: '0%' }
                      }
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {!userId && (
            <div>
              <h1 className='font-bold text-[20px]'>Not Authenticated</h1>
              <Login setUserId={setUserId} />
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default Call;
