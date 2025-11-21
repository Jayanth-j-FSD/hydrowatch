import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          HydroWatch
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Real-time water and climate monitoring platform for tracking rivers, dams, groundwater, and rainfall
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>River Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Monitor real-time river water levels and flood risks
            </p>
            <Link href="/river">
              <Button variant="primary" className="w-full">
                View Rivers
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dams Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Track reservoir capacity and power generation
            </p>
            <Link href="/dams">
              <Button variant="primary" className="w-full">
                View Dams
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Groundwater</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Visualize groundwater depth and quality data
            </p>
            <Link href="/groundwater">
              <Button variant="primary" className="w-full">
                View Groundwater
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rainfall Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              7-day forecasts and historical patterns
            </p>
            <Link href="/rainfall">
              <Button variant="primary" className="w-full">
                View Forecast
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-600 dark:text-gray-400">
            <li>✓ Real-time data updates</li>
            <li>✓ Flood risk alerts</li>
            <li>✓ Historical data analysis</li>
            <li>✓ Interactive maps</li>
            <li>✓ Custom alert configurations</li>
            <li>✓ Export reports (PDF/CSV)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
