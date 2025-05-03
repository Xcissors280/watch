import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Toggle } from "@/components/buttons/Toggle";
import { Icon, Icons } from "@/components/Icon";
import { SettingsCard } from "@/components/layout/SettingsCard";
import { Stepper } from "@/components/layout/Stepper";
import { BiggerCenterContainer } from "@/components/layout/ThinContainer";
import { VerticalLine } from "@/components/layout/VerticalLine";
import {
  FancyModal,
  Modal,
  ModalCard,
  useModal,
} from "@/components/overlays/Modal";
import {
  StatusCircle,
  StatusCircleProps,
} from "@/components/player/internals/StatusCircle";
import { MwLink } from "@/components/text/Link";
import { AuthInputBox } from "@/components/text-inputs/AuthInputBox";
import { Divider } from "@/components/utils/Divider";
import { Heading1, Heading2, Paragraph } from "@/components/utils/Text";
import { MinimalPageLayout } from "@/pages/layouts/MinimalPageLayout";
import {
  useNavigateOnboarding,
  useRedirectBack,
} from "@/pages/onboarding/onboardingHooks";
import {
  Card,
  CardContent,
  Link,
  MiniCardContent,
} from "@/pages/onboarding/utils";
import { PageTitle } from "@/pages/parts/util/PageTitle";
import { conf } from "@/setup/config";
import { useAuthStore } from "@/stores/auth";
import { getProxyUrls } from "@/utils/proxyUrls";

import { Status, testFebboxToken } from "../parts/settings/SetupPart";

async function getFebboxTokenStatus(febboxToken: string | null) {
  if (febboxToken) {
    const status: Status = await testFebboxToken(febboxToken);
    return status;
  }
  return "unset";
}

export function FEDAPISetup() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const febboxToken = useAuthStore((s) => s.febboxToken);
  const setFebboxToken = useAuthStore((s) => s.setFebboxToken);

  const [status, setStatus] = useState<Status>("unset");
  const statusMap: Record<Status, StatusCircleProps["type"]> = {
    error: "error",
    success: "success",
    unset: "noresult",
  };

  useEffect(() => {
    const checkTokenStatus = async () => {
      const result = await getFebboxTokenStatus(febboxToken);
      setStatus(result);
    };
    checkTokenStatus();
  }, [febboxToken]);

  const [showVideo, setShowVideo] = useState(false);

  if (conf().ALLOW_FEBBOX_KEY) {
    return (
      <div className="mt-12">
        <SettingsCard>
          <div className="flex justify-between items-center gap-4">
            <div className="my-3">
              <p className="text-white font-bold mb-3">
                {t("fedapi.onboarding.title")}
              </p>
              <p className="max-w-[30rem] font-medium">
                <Trans i18nKey="fedapi.onboarding.description" />
              </p>
            </div>
            <div>
              <Toggle
                onClick={() => setIsExpanded(!isExpanded)}
                enabled={isExpanded}
              />
            </div>
          </div>
          {isExpanded ? (
            <>
              <Divider marginClass="my-6 px-8 box-content -mx-8" />

              <div className="my-3">
                <p className="max-w-[30rem] font-medium">
                  {t("fedapi.setup.title")}
                  <br />
                  <div
                    onClick={() => setShowVideo(!showVideo)}
                    className="flex items-center justify-between p-1 px-2 my-2 w-fit border border-type-secondary rounded-lg cursor-pointer text-type-secondary hover:text-white transition-colors duration-200"
                  >
                    <span className="text-sm">
                      {showVideo
                        ? t("fedapi.setup.hideVideo")
                        : t("fedapi.setup.showVideo")}
                    </span>
                    {showVideo ? (
                      <Icon icon={Icons.CHEVRON_UP} className="pl-1" />
                    ) : (
                      <Icon icon={Icons.CHEVRON_DOWN} className="pl-1" />
                    )}
                  </div>
                  {showVideo && (
                    <>
                      <div className="relative pt-[56.25%] mt-2">
                        <iframe
                          src="https://player.vimeo.com/video/1059834885?h=c3ab398d42&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                          className="absolute top-0 left-0 w-full h-full border border-type-secondary rounded-lg bg-black"
                          title="P-Stream FED API Setup Tutorial"
                        />
                      </div>
                      <br />
                    </>
                  )}
                  <Trans i18nKey="fedapi.setup.step.1">
                    <MwLink url="https://febbox.com" />
                  </Trans>
                  <br />
                  <Trans i18nKey="fedapi.setup.step.2" />
                  <br />
                  <Trans i18nKey="fedapi.setup.step.3" />
                  <br />
                  <Trans i18nKey="fedapi.setup.step.4" />

                  <br />
                  <Trans i18nKey="fedapi.setup.step.5" />
                </p>
                <p className="text-type-danger mt-2">
                  <Trans i18nKey="fedapi.setup.step.warning" />
                </p>
              </div>

              <Divider marginClass="my-6 px-8 box-content -mx-8" />
              <p className="text-white font-bold mb-3">
                {t("settings.connections.febbox.tokenLabel", "Token")}
              </p>
              <div className="flex items-center w-full">
                <StatusCircle type={statusMap[status]} className="mx-2 mr-4" />
                <AuthInputBox
                  onChange={(newToken) => {
                    setFebboxToken(newToken);
                  }}
                  value={febboxToken ?? ""}
                  placeholder="eyABCdE..."
                  passwordToggleable
                  className="flex-grow"
                />
              </div>
              {status === "error" && (
                <p className="text-type-danger mt-4">
                  {t("fedapi.status.failure")}
                </p>
              )}
            </>
          ) : null}
        </SettingsCard>
      </div>
    );
  }
}

export function OnboardingPage() {
  const navigate = useNavigateOnboarding();
  const skipModal = useModal("skip");
  const infoModal = useModal("info");
  const { completeAndRedirect } = useRedirectBack();
  const { t } = useTranslation();
  const noProxies = getProxyUrls().length === 0;

  const isSafari =
    typeof navigator !== "undefined" &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent) &&
    !/Edg/.test(navigator.userAgent);

  return (
    <MinimalPageLayout>
      <PageTitle subpage k="global.pages.onboarding" />
      <Modal id={skipModal.id}>
        <ModalCard>
          <Heading1 className="!mt-0 !mb-4 !text-2xl">
            {t("onboarding.defaultConfirm.title")}
          </Heading1>
          <Paragraph className="!mt-1 !mb-12">
            {t("onboarding.defaultConfirm.description")}
          </Paragraph>
          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between">
            <Button theme="secondary" onClick={skipModal.hide}>
              {t("onboarding.defaultConfirm.cancel")}
            </Button>
            <Button theme="purple" onClick={() => completeAndRedirect()}>
              {t("onboarding.defaultConfirm.confirm")}
            </Button>
          </div>
        </ModalCard>
      </Modal>
      <FancyModal
        id={infoModal.id}
        title={t("onboarding.start.moreInfo.title")}
        size="xl"
      >
        <div>
          <p>
            {t("onboarding.start.moreInfo.explainer.intro")}
            <br />
            <br />
            <strong>{t("onboarding.start.moreInfo.explainer.options")}</strong>
            <br />
            <strong>
              {t("onboarding.start.moreInfo.explainer.extension")}
            </strong>
            <br />
            {t("onboarding.start.moreInfo.explainer.extensionDescription")}
            <br />
            <br />
            <strong>{t("onboarding.start.moreInfo.explainer.proxy")}</strong>
            <br />
            {t("onboarding.start.moreInfo.explainer.proxyDescription")}
            <br />
            <br />
            <strong>{t("onboarding.start.moreInfo.explainer.default")}</strong>
            <br />
            {t("onboarding.start.moreInfo.explainer.defaultDescription")}
            <br />
            <br />
            {conf().ALLOW_FEBBOX_KEY && (
              <>
                <strong>
                  {t("onboarding.start.moreInfo.explainer.fedapi.fedapi")}
                </strong>
                <br />
                {t(
                  "onboarding.start.moreInfo.explainer.fedapi.fedapiDescription",
                )}
                <br />
                <br />
              </>
            )}
            <Trans i18nKey="onboarding.start.moreInfo.explainer.outro">
              <a
                href="https://discord.com/invite/7z6znYgrTG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-type-link"
              />
            </Trans>
          </p>
        </div>
      </FancyModal>
      <BiggerCenterContainer>
        <Stepper steps={2} current={1} className="mb-12" />
        <Heading2 className="!mt-0 !text-3xl">
          {t("onboarding.start.title")}
        </Heading2>
        <Paragraph className="max-w-[360px]">
          {t("onboarding.start.explainer")}
          <div
            className="pt-4 flex cursor-pointer items-center text-type-link"
            onClick={() => infoModal.show()}
          >
            <Trans i18nKey="onboarding.start.moreInfo.button" />
            <Icon className="pl-2" icon={Icons.CIRCLE_QUESTION} />
          </div>
        </Paragraph>

        {/* Desktop Cards */}
        <div className="hidden md:flex w-full flex-col md:flex-row gap-3 pb-6">
          <Card
            onClick={() => navigate("/onboarding/extension")}
            className="md:w-1/3 md:h-full"
          >
            <CardContent
              colorClass="!text-onboarding-best"
              title={t("onboarding.start.options.extension.title")}
              subtitle={t("onboarding.start.options.extension.quality")}
              description={t("onboarding.start.options.extension.description")}
            >
              <Link className="!text-onboarding-best">
                {t("onboarding.start.options.extension.action")}
              </Link>
            </CardContent>
          </Card>
          <div className="hidden md:grid grid-rows-[1fr,auto,1fr] justify-center gap-4">
            <VerticalLine className="items-end" />
            <span className="text-xs uppercase font-bold">
              {t("onboarding.start.options.or")}
            </span>
            <VerticalLine />
          </div>
          <Card
            onClick={() => navigate("/onboarding/proxy")}
            className="md:w-1/3"
          >
            <CardContent
              colorClass="!text-onboarding-good"
              title={t("onboarding.start.options.proxy.title")}
              subtitle={t("onboarding.start.options.proxy.quality")}
              description={t("onboarding.start.options.proxy.description")}
            >
              <Link>{t("onboarding.start.options.proxy.action")}</Link>
            </CardContent>
          </Card>
          {noProxies ? null : (
            <>
              <div className="hidden md:grid grid-rows-[1fr,auto,1fr] justify-center gap-4">
                <VerticalLine className="items-end" />
                <span className="text-xs uppercase font-bold">
                  {t("onboarding.start.options.or")}
                </span>
                <VerticalLine />
              </div>
              <Card
                onClick={
                  isSafari
                    ? () => completeAndRedirect() // Skip modal on Safari
                    : skipModal.show // Show modal on other browsers
                }
                className="md:w-1/3"
              >
                <CardContent
                  colorClass="!text-onboarding-bad"
                  title={t("onboarding.defaultConfirm.confirm")}
                  subtitle=""
                  description={t("onboarding.defaultConfirm.description")}
                >
                  <Trans i18nKey="onboarding.start.options.default.text" />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex w-full flex-col md:flex-row gap-3 pb-6">
          <Card
            onClick={() => navigate("/onboarding/extension")}
            className="md:w-1/3 md:h-full"
          >
            <MiniCardContent
              colorClass="!text-onboarding-best"
              title={t("onboarding.start.options.extension.title")}
              subtitle={t("onboarding.start.options.extension.quality")}
              description={t("onboarding.start.options.extension.description")}
            />
          </Card>
          <Card
            onClick={() => navigate("/onboarding/proxy")}
            className="md:w-1/3"
          >
            <MiniCardContent
              colorClass="!text-onboarding-good"
              title={t("onboarding.start.options.proxy.title")}
              subtitle={t("onboarding.start.options.proxy.quality")}
              description={t("onboarding.start.options.proxy.description")}
            />
          </Card>
          {noProxies ? null : (
            <Card
              onClick={
                isSafari
                  ? () => completeAndRedirect() // Skip modal on Safari
                  : skipModal.show // Show modal on other browsers
              }
              className="md:w-1/3"
            >
              <MiniCardContent
                colorClass="!text-onboarding-bad"
                title={t("onboarding.defaultConfirm.confirm")}
                subtitle=""
                description={t("onboarding.defaultConfirm.description")}
              />
            </Card>
          )}
        </div>

        <FEDAPISetup />
      </BiggerCenterContainer>
    </MinimalPageLayout>
  );
}
