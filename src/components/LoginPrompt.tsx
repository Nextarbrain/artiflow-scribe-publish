
import React from 'react';
import { Star } from 'lucide-react';

const LoginPrompt = () => {
  return (
    <div className="mt-8 text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
      <p className="text-blue-800 dark:text-blue-200 font-medium">
        You'll need to login after selecting publishers to continue with article creation.
      </p>
    </div>
  );
};

export default LoginPrompt;
