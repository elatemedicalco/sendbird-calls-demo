import React, { useState } from 'react';

const Dialer = ({ makeCall }) => {
  const [userIdError, setUserIdError] = useState(null);
  const [userId, setUserId] = useState('');

  const initiateCall = (isVideoCall) => {
    setUserIdError(null);
    if (!userId) {
      return setUserIdError('Please input a User ID');
    }
    makeCall({ userId, isVideoCall });
  };

  return (
    <div className='bg-gray-100 rounded-md px-12 py-14 flex flex-col space-y-4 '>
      <div className='font-bold text-xl text-center'>Dial Someone</div>
      <div>
        <label
          htmlFor='userId'
          className='block text-sm font-medium leading-6 text-gray-900'
        >
          User ID
        </label>
        <div className='mt-2'>
          <div className='flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600'>
            <input
              value={userId}
              onChange={(e) => {
                e.preventDefault();
                setUserIdError(null);
                const value = e.target.value;
                const strippedValue = value.replace(/\s+/g, '');
                setUserId(strippedValue);
              }}
              type='text'
              id='userId'
              name='userId'
              autoComplete='username'
              className='block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6'
              placeholder='User ID'
              required
            />
          </div>
          <div className='text-red-400 text-xs pt-2'>
            {userIdError && <div>{userIdError}</div>}
          </div>
        </div>
      </div>
      <div className='flex justify-center pt-20'>
        <div className='mt-2 flex space-x-4'>
          <button
            onClick={() => initiateCall(true)}
            className='bg-blue-600 rounded-lg px-8 py-2 text-white'
          >
            Video
          </button>
          <button
            onClick={() => initiateCall(false)}
            className='bg-pink-600 rounded-lg px-8 py-2 text-white'
          >
            Audio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialer;
