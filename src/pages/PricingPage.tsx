// import { Check } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import Button from '../components/ui/Button';
// import Card, { CardContent } from '../components/ui/Card';
// import PageContainer from '../components/layout/PageContainer';

// const plans = [
//   {
//     name: 'Starter',
//     price: 14.99,
//     credits: 3,
//     features: [
//       'Real-time interview assistance',
//       'Basic answer suggestions',
//       'Screen sharing support',
//       'Live transcription'
//     ]
//   },
//   {
//     name: 'Plus',
//     price: 29.99,
//     credits: 7,
//     bonusCredits: 1,
//     popular: true,
//     features: [
//       'Everything in Starter',
//       'Advanced answer suggestions',
//       'Resume analysis',
//       'Interview recording',
//       'Basic performance analytics'
//     ]
//   },
//   {
//     name: 'Advanced',
//     price: 44.99,
//     credits: 14,
//     bonusCredits: 5,
//     features: [
//       'Everything in Plus',
//       'Premium answer suggestions',
//       'Multiple resume support',
//       'Detailed performance analytics',
//       'Priority support'
//     ]
//   }
// ];

// const PricingPage = () => {
//   return (
//     <PageContainer>
//       <div className="text-center max-w-3xl mx-auto mb-12">
//         <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
//         <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
//           Choose the plan that works best for you
//         </p>
//         <div className="inline-block bg-primary-50 dark:bg-primary-900/20 rounded-lg px-4 py-2">
//           <p className="text-primary-700 dark:text-primary-300 font-medium">
//             1 Credit = 1 Hour of Interview Assistance
//           </p>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//         {plans.map((plan) => (
//           <Card
//             key={plan.name}
//             className={`relative ${
//               plan.popular
//                 ? 'border-2 border-primary-500 dark:border-primary-400'
//                 : ''
//             }`}
//           >
//             {plan.popular && (
//               <div className="absolute -top-4 left-1/2 -translate-x-1/2">
//                 <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
//                   Most Popular
//                 </span>
//               </div>
//             )}

//             <CardContent className="p-6">
//               <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
//               <div className="mb-6">
//                 <span className="text-4xl font-bold">${plan.price}</span>
//               </div>

//               <div className="mb-6">
//                 <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center">
//                   <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
//                     {plan.credits} Hours of Interview Time
//                   </div>
//                   {plan.bonusCredits && (
//                     <div className="text-sm text-primary-600 dark:text-primary-400">
//                       +{plan.bonusCredits} Bonus Hours Free
//                     </div>
//                   )}
//                   <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                     ({plan.credits + (plan.bonusCredits || 0)} total hours)
//                   </div>
//                 </div>
//               </div>

//               <ul className="space-y-3 mb-8">
//                 {plan.features.map((feature) => (
//                   <li key={feature} className="flex items-start gap-2">
//                     <Check className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
//                     <span>{feature}</span>
//                   </li>
//                 ))}
//               </ul>

//               <Link to="/interview">
//                 <Button
//                   variant={plan.popular ? 'primary' : 'outline'}
//                   className="w-full"
//                 >
//                   Buy Now
//                 </Button>
//               </Link>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </PageContainer>
//   );
// };

// export default PricingPage;