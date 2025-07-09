import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Syringe, HeartPulse, Weight, Thermometer, Pill } from 'lucide-react';

const healthData = {
  lastVetVisit: '2024-05-20',
  weight: 30, // in kg
  temperature: 38.5, // in Celsius
  vaccinations: [
    { name: 'Rabies', date: '2024-01-15', nextDue: '2025-01-15' },
    { name: 'DHPP', date: '2024-01-15', nextDue: '2027-01-15' },
  ]
};

function HealthTile({ icon: Icon, title, value, unit, colorClass }: { icon: React.ElementType, title: string, value: string | number, unit?: string, colorClass: string}) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClass.replace('text-', 'bg-')}/20`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-lg ml-1 font-medium text-gray-500">{unit}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HealthPage() {
  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
            <h1 className="font-headline text-3xl font-bold text-gray-900">Health Overview</h1>
            <p className="text-gray-700">Key health metrics and vaccination history.</p>
        </header>

        <main className="space-y-8">
          <section>
            <h2 className="font-headline text-2xl font-semibold text-gray-900 mb-4">Vitals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <HealthTile icon={HeartPulse} title="Last Vet Visit" value={new Date(healthData.lastVetVisit).toLocaleDateString()} colorClass="text-coral-blush" />
              <HealthTile icon={Weight} title="Weight" value={healthData.weight} unit="kg" colorClass="text-mint-green" />
              <HealthTile icon={Thermometer} title="Temperature" value={healthData.temperature} unit="°C" colorClass="text-lavender" />
            </div>
          </section>

          <section>
             <h2 className="font-headline text-2xl font-semibold text-gray-900 mb-4">Vaccination Status</h2>
             <Card className="rounded-2xl shadow-md">
                <CardContent className="p-6 space-y-4">
                  {healthData.vaccinations.map((vax) => (
                    <div key={vax.name} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-lg bg-gray-50/80">
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-mint-green"/>
                        <div>
                           <p className="font-bold text-gray-900">{vax.name}</p>
                           <p className="text-sm text-gray-600">Last given: {new Date(vax.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                       <p className="text-sm text-gray-600 mt-2 sm:mt-0">
                          Next due: <span className="font-semibold text-gray-800">{new Date(vax.nextDue).toLocaleDateString()}</span>
                       </p>
                    </div>
                  ))}
                </CardContent>
             </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
