import { OperationsConsole } from "@/components/OperationsConsole";

export default function HomePage() {
  return <OperationsConsole initialNow={new Date().toISOString()} />;
}
