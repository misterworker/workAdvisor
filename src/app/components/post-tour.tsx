import { useEffect, useRef } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface PostTourComponentProps {
  tourVisible: boolean;
  setTourVisible: (visible: boolean) => void;
}

const PostTourComponent: React.FC<PostTourComponentProps> = ({ tourVisible, setTourVisible  }) => {
  const driverObj = useRef(
    driver({
      showProgress: true,
      steps: [
        {
          popover: {
            title: 'Welcome to Post Prediction',
            description: 'This tool solves the lack of access to personalized guidance for students and professionals.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#craft-post',
          popover: {
            title: 'Craft Post',
            description: 'Select a category, and write your title and content here.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#validate-button',
          popover: {
            title: 'Validate Post',
            description: 'Click here to validate your post and get feedback.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#ai',
          popover: {
            title: 'AI Generated Feedback',
            description: 'Here you\'ll see the AI feedback on your post.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#suggestion-button',
          popover: {
            title: 'AI Generated Suggestion',
            description: 'Click to update your post title and content based on AI suggested feedback',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#analysis-result',
          popover: {
            title: 'Prediction Results',
            description: 'See the prediction of your post\'s popularity.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#history',
          popover: {
            title: 'Past Analyses',
            description: 'Access your past post analyses here.',
            side: 'top',
            align: 'start',
          },
        },
      ],
    })
  );

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenPostTour");

    if (!hasSeenTour || tourVisible) {
      driverObj.current.drive();
      localStorage.setItem("hasSeenPostTour", "true");
      
      setTourVisible(false);
    }
  }, [tourVisible, setTourVisible]);

  return null;
};

export default PostTourComponent;
