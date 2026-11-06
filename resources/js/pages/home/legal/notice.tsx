import { LegalPage } from '@/components/legal-page';
import { legalEntity } from '@/data/legal';

export default function LegalNotice() {
    return (
        <LegalPage
            current="Mentions légales"
            title="Mentions légales"
            intro={
                <p>
                    Informations sur l’éditeur et l’hébergeur du site{' '}
                    {legalEntity.brand}, conformément à la loi pour la confiance
                    dans l’économie numérique (LCEN).
                </p>
            }
            sections={[
                {
                    id: 'editeur',
                    title: 'Éditeur du site',
                    content: (
                        <ul>
                            <li>
                                <strong>Société :</strong>{' '}
                                {legalEntity.companyName},{' '}
                                {legalEntity.legalForm}
                            </li>
                            <li>
                                <strong>Immatriculation :</strong>{' '}
                                {legalEntity.registration}
                            </li>
                            <li>
                                <strong>TVA :</strong> {legalEntity.vatNumber}
                            </li>
                            <li>
                                <strong>Siège :</strong> {legalEntity.address}
                            </li>
                            <li>
                                <strong>Contact :</strong> {legalEntity.email}
                            </li>
                            <li>
                                <strong>Directeur de la publication :</strong>{' '}
                                {legalEntity.publicationDirector}
                            </li>
                        </ul>
                    ),
                },
                {
                    id: 'hebergeur',
                    title: 'Hébergeur',
                    content: <p>{legalEntity.host}</p>,
                },
                {
                    id: 'propriete',
                    title: 'Propriété intellectuelle',
                    content: (
                        <p>
                            Les contenus du site (textes, supports de cours,
                            logos, visuels) sont protégés par le droit d’auteur.
                            Toute reproduction ou diffusion sans autorisation
                            écrite est interdite, sauf usage strictement
                            personnel dans le cadre des cours.
                        </p>
                    ),
                },
                {
                    id: 'donnees',
                    title: 'Données personnelles et cookies',
                    content: (
                        <p>
                            Le traitement de tes données et l’usage des cookies
                            sont décrits dans la politique de confidentialité.
                        </p>
                    ),
                },
            ]}
        />
    );
}
