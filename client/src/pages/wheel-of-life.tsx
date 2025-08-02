import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  assessmentSchema, 
  emailResultsSchema, 
  lifeCategories, 
  lifeCategoryLabels,
  type AssessmentData,
  type EmailResultsRequest,
  type CalculatedResults,
  type LifeCategory
} from "@shared/schema";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type Section = "intro" | "satisfaction" | "motivation" | "results";

export default function WheelOfLife() {
  const [currentSection, setCurrentSection] = useState<Section>("intro");
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    satisfaction: {},
    motivation: {}
  });

  const [calculatedResults, setCalculatedResults] = useState<CalculatedResults | null>(null);

  const strongestAreas = calculatedResults
    ? calculatedResults.priorityRanked
        .filter(item => item.satisfaction >= 7)
        .map(item => item.label)
        .join(', ')
    : '';

  const { toast } = useToast();

  const emailForm = useForm<EmailResultsRequest>({
    resolver: zodResolver(emailResultsSchema),
    defaultValues: {
      email: "",
      name: "",
      updates: false,
      assessmentData: assessmentData
    }
  });

  const emailMutation = useMutation({
    mutationFn: async (data: EmailResultsRequest) => {
      const response = await apiRequest("POST", "/api/email-results", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message,
      });
      emailForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateResults = (): CalculatedResults => {
    const results: CalculatedResults = {
      satisfaction: {} as Record<string, number>,
      motivation: {} as Record<string, number>,
      improvement: {} as Record<string, number>,
      priority: {} as Record<string, number>,
      priorityRanked: []
    };

    lifeCategories.forEach(category => {
      const satisfaction = assessmentData.satisfaction[category] || 1;
      const motivation = assessmentData.motivation[category] || 1;
      
      results.satisfaction[category] = satisfaction;
      results.motivation[category] = motivation;
      results.improvement[category] = 10 - satisfaction;
      results.priority[category] = (10 - satisfaction) * motivation;
    });

    results.priorityRanked = lifeCategories
      .map(category => ({
        category,
        label: lifeCategoryLabels[category],
        satisfaction: results.satisfaction[category],
        motivation: results.motivation[category],
        improvement: results.improvement[category],
        priority: results.priority[category]
      }))
      .sort((a, b) => b.priority - a.priority);

    return results;
  };

  const updateAssessmentData = (category: LifeCategory, type: 'satisfaction' | 'motivation', value: number) => {
    setAssessmentData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: value
      }
    }));
  };

  const showResults = () => {
    const results = calculateResults();
    setCalculatedResults(results);
    setCurrentSection("results");
  };

  const onEmailSubmit = (data: Omit<EmailResultsRequest, 'assessmentData'>) => {
    emailMutation.mutate({
      ...data,
      assessmentData: assessmentData
    });
  };

  const getRadarData = () => {
    if (!calculatedResults) return [];
    
    return lifeCategories.map(category => ({
      category: lifeCategoryLabels[category],
      satisfaction: calculatedResults.satisfaction[category],
      fullMark: 10
    }));
  };

  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    if (currentSection === "results") {
      scrollToSection("results-section");
    }
  }, [currentSection]);

  return (
    <div className="bg-cream text-charcoal min-h-screen">
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-charcoal mb-4">
            Wheel of Life Assessment
          </h1>
          <p className="text-lg text-charcoal/80 max-w-2xl mx-auto leading-relaxed">
            Discover balance in your life through this thoughtful self-reflection tool. Take a moment to honestly assess where you are and where you'd like to focus your energy.
          </p>
        </div>
      </header>

      {/* Intro Section */}
      {currentSection === "intro" && (
        <section className="py-12 px-4 fade-in">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-sage/20">
              <CardContent className="p-8 md:p-12">
                <h2 className="font-playfair text-3xl font-medium mb-6 text-center">How It Works</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-sage rounded-full flex items-center justify-center text-charcoal font-medium flex-shrink-0 mt-1">1</div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Rate Your Current Satisfaction</h3>
                      <p className="text-charcoal/70">For each of the 8 life areas, rate how satisfied you feel right now on a scale of 1-10.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-muted-sage rounded-full flex items-center justify-center text-charcoal font-medium flex-shrink-0 mt-1">2</div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Rate Your Motivation to Improve</h3>
                      <p className="text-charcoal/70">Next, rate how motivated you are to improve each area, even if you're already satisfied.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-beige rounded-full flex items-center justify-center text-charcoal font-medium flex-shrink-0 mt-1">3</div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">View Your Results</h3>
                      <p className="text-charcoal/70">See your personalized wheel chart and discover which areas have the highest priority for growth.</p>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <Button 
                    onClick={() => setCurrentSection("satisfaction")}
                    className="bg-sage hover:bg-sage/80 text-charcoal px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-md transform hover:scale-105"
                  >
                    Begin Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Satisfaction Section */}
      {currentSection === "satisfaction" && (
        <section className="py-12 px-4 fade-in">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-sage/20">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="font-playfair text-3xl font-medium mb-4">How are things feeling?</h2>
                  <p className="text-charcoal/70 text-lg">Rate your current satisfaction in each life area from 1 (very dissatisfied) to 10 (completely satisfied)</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {lifeCategories.map(category => (
                    <div key={category} className="space-y-3">
                      <Label className="block font-medium text-charcoal">{lifeCategoryLabels[category]}</Label>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-charcoal/60 w-4">1</span>
                        <Slider
                          value={[assessmentData.satisfaction[category] || 5]}
                          onValueChange={([value]) => updateAssessmentData(category, 'satisfaction', value)}
                          max={10}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-charcoal/60 w-6">10</span>
                        <span className="w-8 text-center font-medium bg-sage/20 rounded px-2 py-1">
                          {assessmentData.satisfaction[category] || 5}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button 
                    onClick={() => setCurrentSection("motivation")}
                    className="bg-muted-sage hover:bg-muted-sage/80 text-charcoal px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
                  >
                    Continue to Motivation →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Motivation Section */}
      {currentSection === "motivation" && (
        <section className="py-12 px-4 fade-in">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-muted-sage/20">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="font-playfair text-3xl font-medium mb-4">Where do you want to focus your energy?</h2>
                  <p className="text-charcoal/70 text-lg">Rate your motivation to improve each area from 1 (no motivation) to 10 (extremely motivated)</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {lifeCategories.map(category => (
                    <div key={category} className="space-y-3">
                      <Label className="block font-medium text-charcoal">{lifeCategoryLabels[category]}</Label>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-charcoal/60 w-4">1</span>
                        <div className="flex-1 h-2 bg-beige/50 rounded-lg relative">
                          <Slider
                            value={[assessmentData.motivation[category] || 5]}
                            onValueChange={([value]) => updateAssessmentData(category, 'motivation', value)}
                            max={10}
                            min={1}
                            step={1}
                            className="flex-1"
                          />
                        </div>
                        <span className="text-sm text-charcoal/60 w-6">10</span>
                        <span className="w-8 text-center font-medium bg-beige/30 rounded px-2 py-1">
                          {assessmentData.motivation[category] || 5}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button 
                    onClick={showResults}
                    className="bg-sage hover:bg-sage/80 text-charcoal px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
                  >
                    View My Results →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Results Section */}
      {currentSection === "results" && calculatedResults && (
        <>
          <section id="results-section" className="py-12 px-4 fade-in">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-playfair text-4xl font-medium mb-4">Your Wheel of Life</h2>
              </div>

              <div className="flex flex-col gap-12 items-start">
                {/* Radar Chart */}
                <Card className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-sage/20">
                  <CardContent className="p-8">
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid stroke="rgba(28, 28, 28, 0.1)" />
                        <PolarAngleAxis 
                          dataKey="category" 
                          tick={{
                            fontSize: 11,
                            fontFamily: 'Poppins',
                            fill: '#1c1c1c'
                          }}
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 10]}
                          tick={{
                            fontSize: 12,
                            fontFamily: 'Poppins',
                            fill: '#1c1c1c'
                          }}
                        />
                        <Radar
                          name="Current Satisfaction"
                          dataKey="satisfaction"
                          stroke="hsl(72, 19%, 84%)"
                          fill="hsl(72, 19%, 84%)"
                          fillOpacity={0.2}
                          strokeWidth={2}
                          dot={{ fill: 'hsl(72, 19%, 84%)', strokeWidth: 2, stroke: '#1c1c1c', r: 6 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>

                  </CardContent>
                </Card>

                {/* Insights Panel */}
                <div className="space-y-6">
                  <Card className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-sage/20">
                    <CardContent className="p-8">
                      <h3 className="font-playfair text-2xl font-medium mb-6">Priority Areas for Growth</h3>
                      <div className="space-y-4">
                        {calculatedResults.priorityRanked.slice(0, 3).map((item, index) => (
                          <div key={item.category} className={`flex items-center justify-between p-4 rounded-xl ${
                            index === 0 ? 'bg-sage/10' : index === 1 ? 'bg-beige/10' : 'bg-muted-sage/10'
                          }`}>
                            <div>
                              <h4 className="font-medium">{item.label}</h4>
                              <p className="text-sm text-charcoal/60">
                                {index === 0 ? 'High improvement potential × strong motivation' :
                                 index === 1 ? 'Significant room for growth' :
                                 'Balanced opportunity for enhancement'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                index === 0 ? 'text-sage' : index === 1 ? 'text-beige' : 'text-muted-sage'
                              }`}>
                                {item.priority}
                              </div>
                              <div className="text-xs text-charcoal/60">Priority Score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-sage/20">
                    <CardContent className="p-8">
                      <h3 className="font-playfair text-2xl font-medium mb-4">Your Insights</h3>
                      <div className="space-y-4 text-charcoal/80">
                        <p>Your strongest areas are: <strong>{strongestAreas || 'No strong areas identified yet'}</strong>.</p>
                        <p>Your highest priority appears to be <strong>{calculatedResults.priorityRanked[0]?.label}</strong> - this suggests you're ready to bring more focus and energy into this area of your life.</p>
                        <div className="text-sm bg-sage/10 p-4 rounded-xl border-l-4 border-sage">
                          <p className="font-medium mb-2">Growth Tip:</p>
                          <p>Start with your highest priority area and commit to one small, consistent action. Small steps in high-motivation areas often create momentum that spreads to other life domains.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Wheel Description Section */}
              <div className="max-w-4xl mx-auto mt-16">
                <Card className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-sage/20">
                  <CardContent className="p-8 md:p-12">
                    <div className="max-w-3xl mx-auto space-y-4 text-charcoal/80">
                      <p className="text-lg font-medium">What does your Wheel look like?</p>
                      <p>Is it nice and rounded? Or does it look unbalanced? Could it perhaps be bigger — why settle for 7s when you could be at 9s and 10s?</p>
                      <p>A perfectly round wheel is actually uncommon. Life is full of shifts and trade-offs. When we focus more on one area, another may naturally take a step back — that's okay. But if the imbalance becomes too big, we feel it.</p>
                      <p>For example, you might score high in career and finances, but lower in personal time or connection with loved ones. That can lead to fatigue or disconnection.</p>
                      <p>Your wheel is unique — it reflects your values, choices, and circumstances. This reflection isn't about judging where you are. It's about noticing what wants to shift.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-br from-sage/10 to-beige/10 rounded-3xl p-12 border border-sage/20">
                <h2 className="font-playfair text-4xl font-medium mb-6 text-charcoal">Ready for What's Next?</h2>
                <div className="text-lg text-charcoal/80 mb-8 max-w-3xl mx-auto leading-relaxed space-y-4">
                  <p>The Wheel of Life shows where you are — not where you have to stay. If you'd like support making sense of what came up — and turning that into meaningful changes — I'd love to work with you.</p>
                  <p>Let's explore together what balance, growth, and clarity can look like for you.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    onClick={() => window.open('https://calendar.app.google/UnZFfYxU96Syr4u4A', '_blank')}
                    className="bg-sage hover:bg-sage/80 text-charcoal px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                  >
                    Book a Session
                  </Button>
                  <Button 
                    onClick={() => {
                      setCurrentSection("intro");
                      setAssessmentData({ satisfaction: {}, motivation: {} });
                      setCalculatedResults(null);
                    }}
                    variant="outline"
                    className="border-2 border-sage text-sage hover:bg-sage hover:text-charcoal px-8 py-4 rounded-xl font-medium transition-all duration-300"
                  >
                    Retake Assessment
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}



      {/* Footer */}
      <footer className="py-8 px-4 border-t border-sage/20 mt-16">
        <div className="max-w-4xl mx-auto text-center text-charcoal/60">
          <p>&copy; 2024 Janette Possul · Mental Health & Well-being Coach · <a href="https://www.janettepossul.com" target="_blank" rel="noopener noreferrer" className="hover:text-sage transition-colors">www.janettepossul.com</a></p>
        </div>
      </footer>
    </div>
  );
}
