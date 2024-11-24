import React from "react";
import {
  PawPrint,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  User,
} from "lucide-react";

function PetCard({ name, species, age, weight }) {
  return (
    <div className="bg-background p-6 rounded-lg shadow-sm border-2 border-green3/60">
      <div className="h-48 bg-green3/10 rounded-lg flex items-center justify-center mb-4">
        <PawPrint size={64} className="text-green2" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-nunito-bold text-green2">{name}</h3>
        <div className="text-sm font-nunito-medium text-primary/50 space-y-1">
          <p>Species: {species}</p>
          <p>Age: {age} years old</p>
          <p>Weight: {weight} kg</p>
        </div>
        <button className="w-full mt-4 px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
          View Profile
        </button>
      </div>
    </div>
  );
}

function MedicalRecord({ clinic, doctor, date, expanded, onToggle }) {
  return (
    <div className="bg-background rounded-lg shadow-sm border-2 border-green3/60">
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-green2" />
            <h3 className="text-base font-nunito-bold text-green2">{clinic}</h3>
          </div>
          <div className="flex items-center gap-2">
            <User size={20} className="text-green2" />
            <p className="text-sm font-nunito-medium text-primary/50">
              {doctor}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-nunito-medium text-primary/50">
            {date}
          </span>
          {expanded ? (
            <ChevronUp size={20} className="text-green2" />
          ) : (
            <ChevronDown size={20} className="text-green2" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="p-4 border-t-2 border-green3/60">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green3/10 rounded-md">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-green2" />
                <span className="text-sm font-nunito-bold text-green2">
                  Prescription
                </span>
              </div>
              <ChevronDown size={20} className="text-green2" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green3/10 rounded-md">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-green2" />
                <span className="text-sm font-nunito-bold text-green2">
                  Symptoms/Observation
                </span>
              </div>
              <ChevronDown size={20} className="text-green2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyPets() {
  const [expandedRecord, setExpandedRecord] = React.useState("record-1");

  const pets = [
    {
      id: 1,
      name: "Max",
      species: "Golden Retriever",
      age: 3,
      weight: 32.5,
    },
    {
      id: 2,
      name: "Bella",
      species: "Persian Cat",
      age: 2,
      weight: 4.2,
    },
  ];

  const medicalRecords = [
    {
      id: "record-1",
      clinic: "Vetic Pet Care Centre, Sector...",
      doctor: "Dr. Anjali Sharma",
      date: "12 Aug, 2024",
    },
    {
      id: "record-2",
      clinic: "Vetic Pet Care Centre, Sector...",
      doctor: "Dr. Anjali Sharma",
      date: "21 Jun, 2024",
    },
  ];

  return (
    <div className="space-y-6 mt-14">
      <div>
        <h1 className="text-2xl font-nunito-bold text-green2">My Pets</h1>
        <div className="flex items-center mt-5">
          <PawPrint className="mr-2 text-primary size-7" />
          <p className="text-xl text-primary font-nunito-bold tracking-wide">
            Manage your pets' profiles and medical records
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <PetCard key={pet.id} {...pet} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-nunito-bold text-green2">
            Medical History
          </h2>
          <button className="flex items-center px-4 py-2 text-sm font-nunito-bold text-green2 bg-green3/20 rounded-md hover:bg-green3/30">
            <Download size={16} className="mr-2" />
            View File
          </button>
        </div>

        <div className="space-y-4">
          {medicalRecords.map((record) => (
            <MedicalRecord
              key={record.id}
              {...record}
              expanded={expandedRecord === record.id}
              onToggle={() =>
                setExpandedRecord(
                  expandedRecord === record.id ? null : record.id
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyPets;
