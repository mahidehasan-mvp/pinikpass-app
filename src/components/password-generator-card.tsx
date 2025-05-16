
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generatePassword, calculatePasswordStrength, PasswordOptions, StrengthResult } from '@/lib/passwordUtils';
import { Copy, Check, ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const STRENGTH_CONFIG = {
  "Very Weak": { icon: ShieldX, className: "text-destructive" },
  "Weak": { icon: ShieldAlert, className: "text-[hsl(var(--chart-1))]" },
  "Medium": { icon: ShieldQuestion, className: "text-[hsl(var(--chart-4))]" },
  "Strong": { icon: ShieldCheck, className: "text-green-500" },
  "Excellent": { icon: ShieldCheck, className: "text-[hsl(var(--chart-2))]" },
  "-": { icon: ShieldQuestion, className: "text-muted-foreground" }
};


export function PasswordGeneratorCard() {
  const [password, setPassword] = useState<string>('');
  const [passwordLength, setPasswordLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [strength, setStrength] = useState<StrengthResult | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [passwordDisplayKey, setPasswordDisplayKey] = useState<number>(0);

  const { toast } = useToast();

  const handleGeneratePassword = () => {
    setIsGenerating(true);
    const options: PasswordOptions = {
      length: passwordLength,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    };
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    setStrength(calculatePasswordStrength(newPassword));
    setPasswordDisplayKey(prev => prev + 1); // Trigger animation

    setTimeout(() => setIsGenerating(false), 300); // Animation duration
  };

  useEffect(() => {
    handleGeneratePassword();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);
  
  useEffect(() => {
    // Calculate initial strength for default empty password or pre-filled
    if (!password) {
        setStrength(calculatePasswordStrength(""));
    } else {
        setStrength(calculatePasswordStrength(password));
    }
  }, [password]);


  const handleCopyToClipboard = () => {
    if (!password || password === 'Please select character types') {
      toast({
        title: "Nothing to copy",
        description: "Generate a password first or select character types.",
        variant: "destructive",
      });
      return;
    }
    navigator.clipboard.writeText(password).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Password has been copied successfully.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy password to clipboard.",
        variant: "destructive",
      });
    });
  };

  const currentStrengthConfig = strength ? STRENGTH_CONFIG[strength.level] : STRENGTH_CONFIG["-"];
  const StrengthIcon = currentStrengthConfig.icon;


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">PINIKPASS</CardTitle>
        <CardDescription className="text-center">
          Generate secure, random passwords with ease.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Input
            key={passwordDisplayKey}
            type="text"
            value={password}
            readOnly
            placeholder="Your Secure Password"
            aria-label="Generated Password"
            className={cn(
              "text-lg pr-12 h-12 text-center font-mono tracking-wider",
               isGenerating && "animate-subtle-pulse"
            )}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
                  aria-label="Copy password to clipboard"
                >
                  {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="length" className="text-base">Password Length:</Label>
            <span className="text-lg font-semibold text-primary">{passwordLength}</span>
          </div>
          <Slider
            id="length"
            min={4}
            max={128}
            step={1}
            value={[passwordLength]}
            onValueChange={(value) => setPasswordLength(value[0])}
            aria-label="Password length slider"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Uppercase (A-Z)', checked: includeUppercase, setter: setIncludeUppercase, id: 'uppercase' },
            { label: 'Lowercase (a-z)', checked: includeLowercase, setter: setIncludeLowercase, id: 'lowercase' },
            { label: 'Numbers (0-9)', checked: includeNumbers, setter: setIncludeNumbers, id: 'numbers' },
            { label: 'Symbols (!@#$)', checked: includeSymbols, setter: setIncludeSymbols, id: 'symbols' },
          ].map(opt => (
            <div key={opt.id} className="flex items-center space-x-2">
              <Checkbox
                id={opt.id}
                checked={opt.checked}
                onCheckedChange={(checked) => opt.setter(checked as boolean)}
              />
              <Label htmlFor={opt.id} className="text-sm cursor-pointer select-none">{opt.label}</Label>
            </div>
          ))}
        </div>
        
        {strength && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StrengthIcon size={20} className={currentStrengthConfig.className} />
                    <Label className={cn("text-sm font-medium", currentStrengthConfig.className)}>{strength.label}</Label>
                </div>
            </div>
            <Progress value={strength.value} aria-label={`Password strength: ${strength.level}`} className="h-3" indicatorClassName={strength.colorClass} />
          </div>
        )}

      </CardContent>
      <CardFooter>
        <Button 
            onClick={handleGeneratePassword} 
            className="w-full h-12 text-lg"
            disabled={isGenerating}
        >
          {isGenerating ? (
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-5 w-5" />
          )}
          Generate Password
        </Button>
      </CardFooter>
    </Card>
  );
}
