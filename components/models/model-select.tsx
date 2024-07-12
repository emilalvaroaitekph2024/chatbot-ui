import { FC, useContext, useEffect, useRef, useState } from "react";
import { ChatbotUIContext } from "@/context/context";
import { LLM, LLMID, ModelProvider } from "@/types";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ModelOption } from "./model-option";

// Mapping function
const mapModelName = (name: string) => {
  const modelNameMapping: { [key: string]: string } = {
    "ModelA": "emilio-aguinaldo",
    "ModelB": "manuel-quezon",
    "ModelC": "jose-laurel",
    "ModelD": "sergio-osmena",
    "ModelE": "manuel-roxas",
    "ModelF": "elpidio-quirino",
    "ModelG": "ramon-magsaysay",
    "ModelH": "carlos-garcia",
    "ModelI": "diosdado-macapagal",
    "ModelJ": "ferdinand-marcos",
    "ModelK": "corazon-aquino",
    "ModelL": "fidel-ramos",
    "ModelM": "joseph-estrada",
    "ModelN": "gloria-arroyo",
    "ModelO": "benigno-aquino",
    "ModelP": "rodrigo-duterte",
    "ModelQ": "ferdinand-marcos-jr",
    "ModelR": "jose-rizal",
    "ModelS": "andres-bonifacio",
    "ModelT": "emilio-jacinto",
    "ModelU": "apolinario-mabini",
    "ModelV": "antonio-luna",
    "ModelW": "mariano-gomez",
    "ModelX": "jose-burgos",
    "ModelY": "jacinto-zamora",
    "ModelZ": "gregorio-del-pilar"
  };
  return modelNameMapping[name] || name;
};

interface ModelSelectProps {
  selectedModelId: string;
  onSelectModel: (modelId: LLMID) => void;
}

export const ModelSelect: FC<ModelSelectProps> = ({
  selectedModelId,
  onSelectModel
}) => {
  const {
    profile,
    models,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels
  } = useContext(ChatbotUIContext);

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"hosted" | "local">("hosted");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // FIX: hacky
    }
  }, [isOpen]);

  const handleSelectModel = (modelId: LLMID) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  const allModels = [
    ...models.map((model) => ({
      modelId: model.model_id as LLMID,
      modelName: mapModelName(model.name),
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false
    })),
    ...availableHostedModels,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ];

  const groupedModels = allModels.reduce<Record<string, LLM[]>>(
    (groups, model) => {
      const key = model.provider;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(model);
      return groups;
    },
    {}
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="outline" className="w-full justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {models.find((model) => model.model_id === selectedModelId)?.name ?? "Select a model"}
            </span>
            <IconChevronDown className="ml-2" size={18} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <Input
          ref={inputRef}
          className="mb-2"
          placeholder="Search models"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-[300px] overflow-auto">
          {Object.entries(groupedModels).map(([provider, models]) => {
            const filteredModels = models
              .filter((model) => {
                if (tab === "hosted") return model.provider !== "ollama";
                if (tab === "local") return model.provider === "ollama";
                if (tab === "openrouter") return model.provider === "openrouter";
                return true;
              })
              .filter((model) =>
                model.modelName.toLowerCase().includes(search.toLowerCase())
              )
              .sort((a, b) => a.provider.localeCompare(b.provider));

            if (filteredModels.length === 0) return null;

            return (
              <div key={provider}>
                <div className="mb-1 ml-2 text-xs font-bold tracking-wide opacity-50">
                  {provider === "openai" && profile.use_azure_openai
                    ? "AZURE OPENAI"
                    : provider.toLocaleUpperCase()}
                </div>
                <div className="mb-4">
                  {filteredModels.map((model) => (
                    <div
                      key={model.modelId}
                      className="flex items-center space-x-1"
                    >
                      {selectedModelId === model.modelId && (
                        <IconCheck className="ml-2" size={32} />
                      )}
                      <ModelOption
                        key={model.modelId}
                        model={model}
                        onSelect={() => handleSelectModel(model.modelId)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
